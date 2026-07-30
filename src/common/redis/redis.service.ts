import { Injectable } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService {
    private readonly redis: Redis;

    constructor() {
        let host = process.env.REDIS_HOST || 'redis';
        if (host === 'localhost' || host === '127.0.0.1') {
            host = 'redis'; 
        }
        const port = process.env.REDIS_PORT || 6379;
        const redisUrl = `redis://${host}:${port}`;

        this.redis = new Redis(redisUrl, {
            maxRetriesPerRequest: 3
        });
    }

    async set(key: string, date: any, ttl: number = 15 * 60) {
        return await this.redis.setex(key, ttl, date);
    }
    
    async get(key: string) {
        return await this.redis.get(key);
    }
    
    async delete(key: string) {
        return await this.redis.del(key);
    }
}