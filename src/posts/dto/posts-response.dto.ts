import PostEntity from '../post.entity';

class PostsResponseDto {
  items: PostEntity[];
  count: number;
}

export default PostsResponseDto;
