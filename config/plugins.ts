export default ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        accessKeyId: env('AWS_ACCESS_KEY_ID'),
        secretAccessKey: env('AWS_ACCESS_SECRET'),
        region: 'ru-central1',
        endpoint: env('AWS_ENDPOINT', 'https://storage.yandexcloud.net'),
        params: {
          Bucket: env('AWS_BUCKET'),
          CacheControl: "public, max-age=864000",
        },
        s3ForcePathStyle: true,
      },
    },
  },
});

// export default ({ env }) => ({
//     upload: {
//       config: {
//         provider: 'aws-s3',
//         providerOptions: {
//             // s3Options: {

//               credentials: {
//                 accessKeyId: env('AWS_ACCESS_KEY_ID'),
//                 secretAccessKey: env('AWS_ACCESS_SECRET'),
//               },
//             //     accessKeyId: env('AWS_ACCESS_KEY_ID'),
//             //     secretAccessKey: env('AWS_ACCESS_SECRET'),
//                 region: 'ru-central1',
//             //     endpoint:'https://storage.yandexcloud.net',
//                 params: {
//                   Bucket: env('AWS_BUCKET'),
//                   CacheControl: "public, max-age=864000"
//                 },

//                  endpoint: env('AWS_ENDPOINT', 'https://storage.yandexcloud.net'),
//                  s3Options: {
//                       s3ForcePathStyle: true,
//                  },
//         // или для некоторых версий Strapi:
//                  forcePathStyle: true,
//                  }
//              },
//       // },
//     },
// });