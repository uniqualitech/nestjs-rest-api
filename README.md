# Nest Js Basic Setup

- [Prerequisites](#prerequisites)
- [Dependencies](#dependencies)
- [Getting Started](#getting-started)
  - [Clone the Repository](#clone-the-repository)
  - [Install Dependencies](#install-dependencies)
  - [Configure Environment Variables](#configure-environment-variables)
  - [Start on the Server](#start-the-server)
  - [Start on the Local](#start-the-local)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

Make sure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (18.16.1)
- [npm](https://www.npmjs.com/) (9.5.1)
- [mysql](https://www.phpmyadmin.net/) (8.0.0)

## Dependencies

Need to install Dependencies for running the App

- Install pm2

```
npm install pm2 -g
```

## 1 Getting Started

### 1.1 Clone the Repository

```bash
git clone https://github.com/uniqualitech/nestjs-rest-api.git
cd nestjs-rest-api.git
```

### 1.2 Install Dependencies

```bash
npm install
```

### 1.3 Configure Environment Variables

Once the dependencies are installed, you can now configure your project by creating a new `.env` file containing your environment variables used for development.

```
cp .env.example .env
vi .env
```

```
# run seeders
$ npm run seed:run

# generate migrations
$ npm run migration:generate -- src/database/migrations/Migrations

# run migrations
$ npm run migration:run

```

### 1.4 Start the Server

- Start app with pm2

```
pm2 start dist/main.js --name <Project Name>:<Project Port>
```

```
For example:
pm2 start dist/main.js --name App-Name:3053
```

- Build & Reload the App

```
npm run build && pm2 reload <Project Port>
```

```
For Example:
npm run build && pm2 reload 1
```

- Reload the app

```bash
pm2 reload <Project Port>
```

```
For Example:
pm2 reload 1
```

### 1.5 Start on the local environment

- Start app in local environment

```
npm run start:dev
```

## Contributing

Thank you for considering contributing to our project! To ensure a smooth collaboration, please follow the guidelines below:

1. Fork the repository and create your branch: `git checkout -b feature/my-feature`.
2. Commit your changes: `git commit -m 'Add some feature'`.
3. Push to the branch: `git push origin feature/my-feature`.
4. Submit a pull request.

Please make sure to update tests as appropriate and adhere to our coding standards.

For major changes, please open an issue first to discuss what you would like to change.

### Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project, you agree to abide by its terms.

## License

This project is licensed under the [Your License] - see the [LICENSE.md](LICENSE.md) file for details.
