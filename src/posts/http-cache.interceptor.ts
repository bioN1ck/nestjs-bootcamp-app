import { ExecutionContext, Injectable } from '@nestjs/common';
import { CACHE_KEY_METADATA, CacheInterceptor } from '@nestjs/cache-manager';

/**
 * If we don’t provide the @CacheKey decorator with a key,
 * NestJS will use the original trackBy method through super.trackBy(context).
 *
 * Otherwise, the HttpCacheInterceptor will create keys like POSTS_CACHE-null
 * and POSTS_CACHE-search=Hello.
 */
@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const cacheKey = this.reflector.get(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );

    if (cacheKey) {
      const request = context.switchToHttp().getRequest();

      return `${cacheKey}-${request._parsedUrl.query}`;
    }

    return super.trackBy(context);
  }
}
