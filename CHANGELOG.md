# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.10.0](https://github.com/thevalidcode/social-media-store-backend/compare/v1.9.0...v1.10.0) (2025-08-18)


### Features

* Add Cancel model and update Refill model with orderUid field ([680a6b9](https://github.com/thevalidcode/social-media-store-backend/commit/680a6b9325d0b6d0d03dda91bec8d7e10062f95f))

## [1.9.0](https://github.com/thevalidcode/social-media-store-backend/compare/v1.8.0...v1.9.0) (2025-08-18)


### Features

* Add support ticket management and statistics endpoints ([796e235](https://github.com/thevalidcode/social-media-store-backend/commit/796e235998cedabcc1a29852f4ff03fb4d9273a4))


### Bug Fixes

* update SSL certificate file extensions from .pem to .crt and .key ([25ea9f0](https://github.com/thevalidcode/social-media-store-backend/commit/25ea9f05701b8c4ee9a5e91f6f422d279a7024fe))
* update SSL certificate file names to use .crt and .key extensions ([ed1fbe4](https://github.com/thevalidcode/social-media-store-backend/commit/ed1fbe4687a0406e0777ed848751ca8d54e8e8ad))
* update SSL certificate paths to use /etc/ssl instead of /etc/letsencrypt ([cd2b8d8](https://github.com/thevalidcode/social-media-store-backend/commit/cd2b8d8be95a33c9320dce0dab0c9d315789b098))

## [1.8.0](https://github.com/thevalidcode/social-media-store-backend/compare/v1.7.0...v1.8.0) (2025-08-11)


### Features

* update database configuration and schemas, add new enum types, and modify import paths ([04f258d](https://github.com/thevalidcode/social-media-store-backend/commit/04f258dba284ecacbc94f208591a4ad32fcc50c7))

## [1.7.0](https://github.com/thevalidcode/social-media-store-backend/compare/v1.6.1...v1.7.0) (2025-08-09)


### Features

* add binary targets for Prisma client to support Debian OpenSSL versions ([836665c](https://github.com/thevalidcode/social-media-store-backend/commit/836665c6e72e16dfc3269ef3a6452fce6af33ce2))
* Add cover image field to blog schema and migrations ([8c5c131](https://github.com/thevalidcode/social-media-store-backend/commit/8c5c131821547bf5dd592a0c94bd63918eca7499))
* add payment gateway routes, controllers, and models; update migrations and schemas ([5561a46](https://github.com/thevalidcode/social-media-store-backend/commit/5561a4674523505b1a8cd27afc36a0f93a4986f5))
* add script to merge Prisma models into a single schema file with manual ordering ([bf0d6ec](https://github.com/thevalidcode/social-media-store-backend/commit/bf0d6ecc263c63bdf100ad7e75d3c5a76b72bd57))
* implement payment gateway integration with webhook support and update schemas ([ca9bb94](https://github.com/thevalidcode/social-media-store-backend/commit/ca9bb9406725c284187087cae5ec2661539c7f81))
* implement payment processing routes, controllers, and schemas; add transaction status enum ([ba247d6](https://github.com/thevalidcode/social-media-store-backend/commit/ba247d6ef660c730d1b5c802322d837c34b340bd))


### Bug Fixes

* change deployment environment to Ubuntu ([8aeab88](https://github.com/thevalidcode/social-media-store-backend/commit/8aeab885bab9f25716fb73c9a371ae831dad7c21))
* change deployment environment to Windows ([1abc952](https://github.com/thevalidcode/social-media-store-backend/commit/1abc952f89133a298d38c7c18f4caf5f8b5e6c3a))
* fixed file casing ([400715c](https://github.com/thevalidcode/social-media-store-backend/commit/400715c06ff637fc38dbfa1efc7f64db2ec8bde1))
* fixed prisma issue ([719e387](https://github.com/thevalidcode/social-media-store-backend/commit/719e387b8e0848921fc1d55d7ef4013b2726a2ba))
* standardize transaction status to uppercase "SUCCESS" ([15c5598](https://github.com/thevalidcode/social-media-store-backend/commit/15c5598bed806262c24eafbf88171b7238530d1f))

### [1.6.1](https://github.com/thevalidcode/social-media-store-backend/compare/v1.6.0...v1.6.1) (2025-07-19)


### Bug Fixes

* renamed components, added cheecking of duplicates for blogs and faqs and also added a route for verifying a user's session. ([9226356](https://github.com/thevalidcode/social-media-store-backend/commit/92263564c2506192677920f423ee863f0d84df8f))

## [1.6.0](https://github.com/thevalidcode/social-media-store-backend/compare/v1.5.1...v1.6.0) (2025-07-18)


### Features

* Add file upload functionality with S3 integration ([156098f](https://github.com/thevalidcode/social-media-store-backend/commit/156098f59883d88d6b226151487d3a2061cb1856))
* Added refills ([8ef5f2b](https://github.com/thevalidcode/social-media-store-backend/commit/8ef5f2b91cbd79b6ce41572746082c9631460f91))


### Bug Fixes

* fixed crud.js to not retrun object on single objects ([f7a69fe](https://github.com/thevalidcode/social-media-store-backend/commit/f7a69fe52beff0295e777ec7e3653ecfcd40ad82))
* Removed the apiKey for getting the user ([0acc329](https://github.com/thevalidcode/social-media-store-backend/commit/0acc329d0e02f178ae4e9746427f67a6312a18ff))

### [1.5.1](https://github.com/thevalidcode/social-media-store-backend/compare/v1.5.0...v1.5.1) (2025-07-10)


### Bug Fixes

* used csrf for cross site protection ([e21d755](https://github.com/thevalidcode/social-media-store-backend/commit/e21d755a01aa0e4c03765288a35667793585b2c4))

## [1.5.0](https://github.com/thevalidcode/social-media-store-backend/compare/v1.4.1...v1.5.0) (2025-07-09)


### Features

* Added blogs and faqs and updated the migrations table. ([0fea309](https://github.com/thevalidcode/social-media-store-backend/commit/0fea3095bc518d115ea7887035d9596876a99e61))


### Bug Fixes

* Added debuging ([3a7b715](https://github.com/thevalidcode/social-media-store-backend/commit/3a7b71512591cfa8a684effde60b49ae3e260346))
* Fixed permissin issue ([0a65658](https://github.com/thevalidcode/social-media-store-backend/commit/0a656583cd4f56edb6e7722ef400caa7213e8764))
* The table creation for the general ([d2e53e6](https://github.com/thevalidcode/social-media-store-backend/commit/d2e53e64b7cc90c3ecb000008e2e72313b2c65e1))
* uncommented store ([ef774b9](https://github.com/thevalidcode/social-media-store-backend/commit/ef774b9e36bdb40cd0afce0b742272cc8d188f94))

### [1.4.1](https://github.com/thevalidcode/social-media-store-backend/compare/v1.4.0...v1.4.1) (2025-07-08)


### Bug Fixes

* Fixed some email issue and added new models to to handle new tables. ([66db2ce](https://github.com/thevalidcode/social-media-store-backend/commit/66db2ceddf47281991dfcf8c3b4f908b7ea57396))

## [1.4.0](https://github.com/thevalidcode/social-media-store-backend/compare/v1.3.4...v1.4.0) (2025-07-07)


### Features

* Updated the authentication logic and changed from panel-related to store. ([d4cf132](https://github.com/thevalidcode/social-media-store-backend/commit/d4cf132c1ee90d8c22aa7ef950ae1a7471141e71))


### Bug Fixes

* final github fix ([cb3a525](https://github.com/thevalidcode/social-media-store-backend/commit/cb3a525fb820fade6e717f91b021a4df0e1c0c9e))
* Fixed github actions to overwrite the current data in the directory. ([54d5635](https://github.com/thevalidcode/social-media-store-backend/commit/54d5635b8007c5dcc365125cb70288c6c4b9429a))
* Github deploy ([4202c87](https://github.com/thevalidcode/social-media-store-backend/commit/4202c8788a8306860249bdc31fbc173f22d8926e))
* Removed rm from github actions ([2d696a8](https://github.com/thevalidcode/social-media-store-backend/commit/2d696a8e613b3a1a79043bdef8bd6320843a92d7))

### [1.3.4](https://github.com/thevalidcode/social-media-store-backend/compare/v1.3.3...v1.3.4) (2025-07-05)


### Bug Fixes

* made seperate route for getting of orders and fixed getting of authenticated user data. ([061c9eb](https://github.com/thevalidcode/social-media-store-backend/commit/061c9ebe3912fcd23f95aefbc15be455ab11d028))

### [1.3.3](https://github.com/thevalidcode/social-media-store-backend/compare/v1.3.2...v1.3.3) (2025-07-05)


### Bug Fixes

* Fixed cors issue and replaced all == with === for accurate result. ([56740e5](https://github.com/thevalidcode/social-media-store-backend/commit/56740e55b9f01436f679af5e63984168fe22b51a))

### [1.3.2](https://github.com/thevalidcode/social-media-store-backend/compare/v1.3.1...v1.3.2) (2025-07-04)


### Bug Fixes

* cors ([cc9f5c7](https://github.com/thevalidcode/social-media-store-backend/commit/cc9f5c768c9bce15418ccc75cb6c5fffd40b4828))
* fix dynamic cors ([838d66e](https://github.com/thevalidcode/social-media-store-backend/commit/838d66ee5aae80b5949a0a8531adcf0290c93630))

### [1.3.1](https://github.com/thevalidcode/social-media-store-backend/compare/v1.3.0...v1.3.1) (2025-07-04)


### Bug Fixes

* fixed cors issue ([49848bb](https://github.com/thevalidcode/social-media-store-backend/commit/49848bb5bba668b690d1cff07acd0526a98f00ee))
* fixed cors issue. ([10f2d29](https://github.com/thevalidcode/social-media-store-backend/commit/10f2d29229ed49ce11eec7e131245ea35a82d161))

## [1.3.0](https://github.com/thevalidcode/social-media-store-backend/compare/v1.2.2...v1.3.0) (2025-07-04)


### Features

* Replaced authenticattion with cookies ([cbe2fb1](https://github.com/thevalidcode/social-media-store-backend/commit/cbe2fb160c3c78504bac8433d38ab3e611420d5a))

### [1.2.2](https://github.com/thevalidcode/social-media-store-backend/compare/v1.2.1...v1.2.2) (2025-07-04)

### [1.2.1](https://github.com/thevalidcode/social-media-store-backend/compare/v1.2.0...v1.2.1) (2025-07-04)


### Bug Fixes

* Fixed the user creation controlller. ([4dea390](https://github.com/thevalidcode/social-media-store-backend/commit/4dea390ad94a3eafbd8c2f78421916c2ee981818))

## [1.2.0](https://github.com/thevalidcode/social-media-store-backend/compare/v1.1.2...v1.2.0) (2025-07-03)


### Features

* Refactored emails and provider cronjobs services. ([9659c16](https://github.com/thevalidcode/social-media-store-backend/commit/9659c16b7538391294af4da8ad440c8a0f93bec6))

### [1.1.2](https://github.com/thevalidcode/social-media-store-backend/compare/v1.1.1...v1.1.2) (2025-07-02)


### Bug Fixes

* Used ftp-deploy to manage files that arent build by typescript. ([f49b123](https://github.com/thevalidcode/social-media-store-backend/commit/f49b12312e1309aaded4c801807204d2028f5b1d))

### [1.1.1](https://github.com/thevalidcode/social-media-store-backend/compare/v1.1.0...v1.1.1) (2025-07-02)


### Bug Fixes

* Updated the script of runing release so it will update the package.json too and fixed the version to load the correct version. ([d2ca928](https://github.com/thevalidcode/social-media-store-backend/commit/d2ca92834263c8e88907d239eb08539eb5289b4b))

## 1.1.0 (2025-07-02)


### Features

* Documented swagger more better, updated the user documentation and added version management ([039a732](https://github.com/thevalidcode/social-media-store-backend/commit/039a732c522d830306175582cd2d9a3975ae545c))
