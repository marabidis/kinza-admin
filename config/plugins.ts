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
  sms: {
    enabled: true,
    resolve: './src/plugins/sms',
  },
});
