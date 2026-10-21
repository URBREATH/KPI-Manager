# KPIM listeners manager


![REPO-TYPE](https://img.shields.io/badge/repo--type-backend-critical?style=for-the-badge&logo=github)


REST APIs for Historical-Data. Microservice part of the KPIM

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites
```batch
>Node.js >= 20
>Typescript >= 5.0
>Express >= 4.0
```

### Installing

To start the application in your local environment do the followings steps

```batch
# Clone this repository 
$ git clone https://github.com/digital-enabler/kpim-listeners-manager.git
```
```batch
# install dependencies
$ npm install
```
Before starting the application it is recommended to properly set the .env variables. You can also choose to use their default value, but double check that they fit with your environment.

# Express Server
```batch
EXPRESS_PORT = port of your express server
```
# ENV Settings
This settings are meant to dynamically change some settings of the project based on they enivronment where are they used, typically DEV or PROD
```batch
ENVIRONMENT = type of use or environment where the project will run
TENANT_ID = tenant id where the project will run
INFLUX_URL = url of the influxdb
INFLUX_TOKEN = token to access influxdb
INFLUX_ORG = name of the influxdb
```
In order to start the project, run the following commands from the app directory:

```batch
# serve
$ npm run start:dev
```
### Build

```batch
$ npm run build
```

## Deployment

In order to deploy the kpim-listeners-manager run this commands from the root folder

```batch
# build the image
$ docker build -f ./docker/Dockerfile /t kpim-listeners-manager:latest .
```
```batch
# Move to the docker directory and run the docker-compose
$ docker compose up -d
```


## Built With

* [Node.js](https://nodejs.org/) - JavaScript runtime environment
* [Typescript](https://www.typescriptlang.org/) - Superset of JavaScript
* [Express](https://expressjs.com/) - Framework web

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](tags). 

## Authors

* **Claudio Bellanti** - *Developer* - [xClaudi0](https://github.com/xClaudi0)


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
