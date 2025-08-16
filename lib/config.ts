const config = {
  env: {
    apiEndpoint: process.env.NEXT_PUBLIC_API_ENDPOINT_URL!,
    imageKit: {
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    },
    postgres: {
      databaseUrl: process.env.POSTGRES_DATABASE_URL!,
    },
    upstash: {
      redisRestUrl: process.env.UPSTASH_REDIS_REST_URL!,
      redisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN!,
      qStashUrl: process.env.QSTASH_URL!,
      qStashToken: process.env.QSTASH_TOKEN!,
      qStashCurrentSignKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
      qStashNextSignKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
    },
  },
};

export { config };
