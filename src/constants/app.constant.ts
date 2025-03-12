import dotenv from 'dotenv';
dotenv.config();

export const BASE_URL = process.env.APP_URL;
export const STORAGE_PATH = 'public/storage';
export const IMAGE_EXTENSIONS = 'jpg|jpeg|png|gif|heic';
export const XLSX_EXTENSIONS = 'xlsx';
export const PDF_EXTENSIONS = 'pdf';
export const DOCS_EXTENSIONS = 'doc|docx';
export const VIDEO_EXTENSIONS = 'mp4|wmv|mov';
export const AUDIO_EXTENSIONS = 'mp3|m4a';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;

export enum DeviceTypes {
  ANDROID = 'Android',
  IOS = 'iOS',
  WEB = 'Web',
}

export enum AppVersionsStatus {
  UP_TO_DATE = 0,
  OUTDATED = 1,
  OPTIONAL = 2,
}

export enum MediaTypes {
  IMAGE = 'image',
  VIDEO = 'video',
  PDF = 'pdf',
  DOCUMENT = 'doc',
}

export enum Languages {
  EN = 'en',
}
