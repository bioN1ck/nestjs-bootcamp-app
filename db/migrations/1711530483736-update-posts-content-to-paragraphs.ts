import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePostsContentToParagraphs1711530483736 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const posts = await queryRunner.query('SELECT id, content FROM post');

    // Update every post by transforming content into paragraphs
    for (const post of posts) {
      const paragraphs = post.content ? [post.content] : [];
      await queryRunner.query(`UPDATE post SET paragraphs = $1 WHERE id = $2`, [
        paragraphs,
        post.id,
      ]);
    }

    // Optionally: delete content clumn
    await queryRunner.dropColumn('post', 'content');
}

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
