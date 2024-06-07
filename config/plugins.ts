export default ({ env }) => ({
    upload: {
      config: {
        provider: 'aws-s3',
        providerOptions: {
            s3Options: {

              credentials: {
                accessKeyId: env('AWS_ACCESS_KEY_ID'),
                secretAccessKey: env('AWS_ACCESS_SECRET'),
              },
            //     accessKeyId: env('AWS_ACCESS_KEY_ID'),
            //     secretAccessKey: env('AWS_ACCESS_SECRET'),
                region: 'ru-central1',
            //     endpoint:'https://storage.yandexcloud.net',
                params: {
                  Bucket: env('AWS_BUCKET'),
                  CacheControl: "public, max-age=864000"
                },
            }
        },
      },
    },
});