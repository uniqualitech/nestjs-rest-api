import { Injectable } from '@nestjs/common';
import dotenv from 'dotenv';
dotenv.config();
import AWS from 'aws-sdk';
import {
  CognitoIdentityClient,
  GetOpenIdTokenForDeveloperIdentityCommand,
} from '@aws-sdk/client-cognito-identity';
import { existsSync, unlinkSync } from 'fs';
import {
  convertFileToBuffer,
  generateThumbnailAndGetMetadata,
} from 'src/helpers/fileupload.helper';
import { User } from '../user/entities/user.entity';

const AWS_BUCKET = process.env.AWS_BUCKET || 'Nest Js Basic Setup';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

@Injectable()
export class AwsService {
  /**
   * Upload media to AWS S3 bucket
   * @param file
   * @param folderName
   * @param contentType
   * @returns
   */
  async uploadToS3(
    file: Express.Multer.File,
    folderName: string,
    contentType: string,
  ) {
    const time = new Date().getTime();
    const ext = contentType.substring(contentType.lastIndexOf('/') + 1);

    const params = {
      Bucket: AWS_BUCKET,
      Key: `${folderName}/${time}-${file.fieldname}.${ext}`, // File name you want to save as in S3
      Body: file.buffer,
      ContentType: contentType,
      // ACL: 'public-read',
      // ContentDisposition: 'inline',
    };

    const s3upload = await s3.upload(params).promise();

    return s3upload.Location;
  }

  /**
   * Delete from S3 bucket
   * @param {*} fileArray
   * @returns
   */
  async deleteFromS3(fileArray: string[]) {
    const objects = [];

    fileArray.forEach((file: string) => {
      const index = file.lastIndexOf('.com/');
      if (index !== -1) {
        const filename = file.slice(index + 5);
        objects.push({ Key: filename });
      }
    });

    if (objects.length > 0) {
      const params = {
        Bucket: AWS_BUCKET,
        Delete: { Objects: objects },
        // Key: filename, // File name you want to delete from s3
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      s3.deleteObjects(params, function (_err, _data) {
        // if (err) console.log(err, err.stack);
        // else console.log(data);
      });
    }
  }

  /**
   * Delete file from S3 bucket
   * @param {*} folder
   * @returns
   */
  async deleteFolderFromS3(folder: string) {
    try {
      // List all objects in the folder
      const listObjectsResponse = await s3
        .listObjectsV2({
          Bucket: AWS_BUCKET,
          Prefix: `${process.env.ENVIRONMENT}/${folder}`,
        })
        .promise();

      // Extract object keys from the response
      const objectKeys = listObjectsResponse.Contents.map((obj) => ({
        Key: obj.Key,
      }));

      // Check if there are objects to delete
      if (objectKeys.length > 0) {
        // Delete the objects
        await s3
          .deleteObjects({
            Bucket: AWS_BUCKET,
            Delete: { Objects: objectKeys },
          })
          .promise();
      }

      // If there are more objects (i.e., the folder has subfolders), recursively delete them
      if (listObjectsResponse.IsTruncated) {
        const lastObjectKey = listObjectsResponse.Contents.slice(-1)[0].Key;
        const nextFolderPath = lastObjectKey.substring(
          0,
          lastObjectKey.lastIndexOf('/') + 1,
        );
        await this.deleteFolderFromS3(nextFolderPath);
      }

      // Finally, delete the empty folder itself
      await s3
        .deleteObject({
          Bucket: AWS_BUCKET,
          Key: folder,
        })
        .promise();

      // console.log(`Folder '${folder}' deleted successfully.`);
    } catch (error) {
      // console.error('Error deleting folder:', error);
    }
  }

  /**
   * Copy Folder
   * @param sourceFolder
   * @param destFolder
   * @returns
   */
  async copyFolder(sourceFolder: string, destFolder: string) {
    const oldFileList = await s3
      .listObjectsV2({ Bucket: AWS_BUCKET, Prefix: destFolder })
      .promise();

    await Promise.all(
      oldFileList.Contents.map(async (content) => {
        const sourceKey = content.Key;
        await s3.deleteObject({ Bucket: AWS_BUCKET, Key: sourceKey }).promise();
      }),
    );

    const newFileList = await s3
      .listObjectsV2({ Bucket: AWS_BUCKET, Prefix: sourceFolder })
      .promise();

    await Promise.all(
      newFileList.Contents.map(async (content) => {
        const sourceKey = content.Key;
        const destKey = `${destFolder}/${sourceKey.substring(
          sourceFolder.length + 1,
        )}`;
        await s3
          .copyObject(
            {
              Bucket: AWS_BUCKET,
              CopySource: `/${AWS_BUCKET}/${sourceKey}`,
              Key: destKey,
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            async (_err, _data) => {
              await s3
                .deleteObject({ Bucket: AWS_BUCKET, Key: sourceKey })
                .promise();

              // console.log('copyObject listObjectsV2 data: ', data);
              // console.log('copyObject listObjectsV2 error: ', err);
            },
          )
          .promise();
      }),
    );
  }

  /**
   * Generate temporary token
   * @param authUser object
   * @returns
   */
  async generateTemporaryCredentials(authUser: User) {
    const cognitoClient = new CognitoIdentityClient({
      region: process.env.AWS_REGION,
      credentials: {
        secretAccessKey: process.env.AWS_SECRET_KEY,
        accessKeyId: process.env.AWS_ACCESS_ID,
      },
    });

    return cognitoClient.send(
      new GetOpenIdTokenForDeveloperIdentityCommand({
        IdentityPoolId: process.env.AWS_IDENTITY_POOL_ID,
        TokenDuration: 300, // in second
        Logins: {
          [process.env.AWS_IDENTITY_DEVELOPER_PROVIDER_NAME]:
            authUser.id.toString(),
        },
      }),
    );
  }

  /**
   * Upload media to AWS S3 bucket
   * @param thumbnail
   * @returns
   */
  async generateAndUploadVideoThumbnail(file: Express.Multer.File) {
    const { thumbnailPath, thumbnailName } =
      await generateThumbnailAndGetMetadata(file);

    const thumbnail: string = thumbnailPath;
    const filename: string = thumbnailName;
    const folderPath = `${process.env.AWS_FOLDER_NAME}/figs`;

    const time = new Date().getTime();

    const fileBuffer = await convertFileToBuffer(thumbnail);

    const params = {
      Bucket: AWS_BUCKET,
      Key: `${folderPath}/${time}-${filename}`, // File name you want to save as in S3
      Body: fileBuffer as Buffer,
    };

    const s3upload = await s3.upload(params).promise();

    const path = `./${thumbnail}`;

    if (existsSync(path)) {
      unlinkSync(path);
    }

    return s3upload.Location;
  }
}
