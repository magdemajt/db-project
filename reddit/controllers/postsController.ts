import express from 'express';
import asyncWrapper from 'common/asyncWrapper';
import db from 'dbConnection';
import { id } from 'inversify';

class ValueRow{
    id_posts: number;
    value: number | null;

    constructor(id_posts: number, val: number | null){
        this.id_posts = id_posts;
        this.value = val;
    }

    static fromJson(json: any): ValueRow{
        return new ValueRow(
            json.id_posts,
            json.sum
        )
    }
}

interface IPostController {
    getPosts(id_groups: number): 
        Promise<{
            id: number, 
            value: number,
            id_users: number,
            name: string,
            title: string,
            post_content: string,
            created_at: string
        }[]>;
    getAllPosts(amount: number):
        Promise<Array<{
            id: number, 
            value: number,
            id_users: number,
            name: string,
            title: string,
            post_content: string,
            created_at: string
        }>>;
        getLikeResultPostAndUser(id_posts: number, id_users: number): Promise<number>;
    getLikeResult(id_posts: number): Promise<number>;
    getLikeResultWithUser(id_users: number): Promise<ValueRow[]>
    addPost(id_users: number, title: string, post_content: string): Promise<boolean>;
    addPostWithGroup(id_users: number, title: string, post_content: string, id_group: number):
    Promise<boolean>;
    insertVote(id_posts: number, id_users: number, value: number): Promise<void>;
    updateVote(id_posts: number, id_users: number, value: number): Promise<void>;
}

const PostRepository: IPostController = {
    async getPosts(id_groups: number):         
        Promise<{
            id: number, 
            value: number,
            id_users: number,
            name: string,
            title: string,
            post_content: string,
            created_at: string
        }[]> {
            const result = await db.query(
                `SELECT p.id, sum(coalesce(pv.value,0)) AS value, p.id_users, u.name, p.title, p.post_content, p.created_at
                FROM posts p
                INNER JOIN users u ON p.id_users = u.id
                INNER JOIN posts_in_groups pig ON p.id = pig.id_posts
                LEFT JOIN posts_votes pv ON p.id = pv.id_posts
                WHERE pig.id_groups = $1
                GROUP BY p.id, p.id_users, u.name,p.title, p.post_content, p.created_at;`,
                [id_groups]
            );
            console.log(result.rows);
            return result.rows;
    },
    async getAllPosts(amount: number):
        Promise<Array<{
            id: number, 
            value: number,
            id_users: number,
            name: string,
            title: string,
            post_content: string,
            created_at: string
        }>> {
            const result = await db.query(
                `SELECT p.id, sum(coalesce(pv.value, 0)) AS value, p.id_users, u.name, p.title, p.post_content, p.created_at
                FROM posts p
                INNER JOIN users u ON p.id_users = u.id
                LEFT JOIN posts_votes pv ON p.id = pv.id_posts
                GROUP BY p.id, p.id_users, u.name,p.title, p.post_content, p.created_at;`
            );
            let posts_array: Array<{
                id: number,
                value: number,
                id_users: number,
                name: string,
                title: string,
                post_content: string,
                created_at: string
            }> = [];
            result.rows.map((post)=>{
                if(posts_array.length < amount){
                    posts_array.push(post);
                }
            });
            return posts_array;
    },
    async getLikeResult(id_posts: number): Promise<number>{
        const result = await db.query(
            `SELECT coalesce(sum(value), 0) AS sum FROM posts_votes
            WHERE id_posts = $1;`,
            [id_posts]
        );
        // console.log(result)
        return result.rows[0].sum;
    },
    async getLikeResultPostAndUser(id_posts: number, id_users: number): Promise<number>{
        const result = await db.query(
            `SELECT value FROM posts_votes
            WHERE id_posts = $1 and id_users = $2;`,
            [id_posts, id_users]
        );
        // console.log(result)
        return result.rows[0].value;
    },
    async getLikeResultWithUser(id_users: number): Promise<ValueRow[]>{
        const result = await db.query(
            `SELECT id_posts, value AS sum FROM posts_votes
            WHERE id_users = $1;`,
            [id_users]
        );
        // console.log(result.rows)
        var arr = Array();
        result.rows.map((arg1)=>{
            // console.log(arg1);
            arr.push(ValueRow.fromJson(arg1));
        });
        // console.log(arr);
        return arr;
    },
    async addPost(id_users: number, title: string, post_content: string):
    Promise<boolean>{
        const result = await db.query(
            `INSERT INTO posts (id_users, title, post_content)
            VALUES ($1, $2, $3);`,
            [id_users, title, post_content]
        );
        // console.log(result);
        return true;
    },
    async addPostWithGroup(id_users: number, title: string, post_content: string, id_groups: number):
    Promise<boolean>{
        const result = await db.query(
            `INSERT INTO posts (id_users, title, post_content)
            VALUES ($1, $2, $3);`,
            [id_users, title, post_content]
        );
        const result_id_posts = await db.query(
            `SELECT id FROM posts
            WHERE id_users = $1 AND  title = $2 AND post_content = $3;`,
            [id_users, title, post_content]
        );
        if(result_id_posts.rows.length == 0){
            return false;
        }
        let id_posts = result_id_posts.rows[0].id;
        console.log(result_id_posts.rows[0].id);
        const result2 = await db.query(
            `INSERT INTO posts_in_groups (id_groups, id_posts)
            VALUES ($1, $2);`,
            [id_groups, id_posts]
        );
        console.log(result2);
        return true;
    },

    async insertVote(id_posts: number, id_users: number, value: number): Promise<void>{
        const res = await db.query(
            `SELECT * FROM posts_votes 
                WHERE id_posts = $1 and id_users = $2;`,
                [id_posts, id_users]
        );
        if(res.rows.length != 0){
            return;
        }
        await db.query(
            `INSERT INTO posts_votes (id_posts, id_users, value)
            VALUES ($1, $2, $3);`,
            [id_posts, id_users, value]
        );
        return;
    },
    async updateVote(id_posts: number, id_users: number, value: number): Promise<void>{
        const res = await db.query(
            `SELECT * FROM posts_votes 
                WHERE id_posts = $1 and id_users = $2;`,
                [id_posts, id_users]
        );
        if(res.rows.length == 0){
            return;
        }
        await db.query(
            `update posts_votes
            SET value = $3
            where id_posts = $1 and id_users = $2;`,
            [id_posts, id_users, value]
        );
        return;
    }
}

const postController = express.Router();

postController.get('', asyncWrapper(async (req, res) => {
    const posts = await PostRepository.getAllPosts(100);
    res.status(200).json({
      posts: posts
    });
  }));

  postController.get('/groupPost/:id_group', asyncWrapper(async (req, res) => {
    const posts = await PostRepository.getPosts(parseInt(req.params.id_group));
    res.status(200).json({
      posts: posts
    });
  }));

  postController.get('/likeResult/:id_posts', asyncWrapper(async (req, res) => {
    const val = await PostRepository.getLikeResult(parseInt(req.params.id_posts));
    res.status(200).json({
      value: val
    });
  }));

  postController.get('/likeResultUser', asyncWrapper(async (req, res) => {
    // console.log(req.session.user?.id);
    // console.log("inside post");
    const val = await PostRepository.getLikeResultWithUser(
        parseInt(req.session.user?.id));

    res.status(200).json({
      value: val
    });

  }));

  postController.post('/insertVote', asyncWrapper(async (req, res) => {
    const userId = +req.session.user?.id;
    await PostRepository.insertVote(+req.body.id_posts, userId, +req.body.value);
    res.status(200).json({});
  }));

  postController.post('/updateVote', asyncWrapper(async (req, res) => {
    const userId = +req.session.user?.id;
    await PostRepository.updateVote(+req.body.id_posts, userId, +req.body.value);
    res.status(200).json({});
  }));

  postController.get('/likeResultWithUserAndPost/:id_posts/', asyncWrapper(async (req, res) => {
    const val = await PostRepository.getLikeResultPostAndUser(
        parseInt(req.params.id_posts), req.session.user?.id);
    res.status(200).json({
      value: val
    });
  }));

  postController.post('/addPost', asyncWrapper(async (req, res) => {
    const userId = +req.session.user?.id;
    // console.log(userId, req.body.title)
    console.log(userId, req.body.title , req.body.post_content, +req.body.id_group);
    // await PostRepository.addPost(userId, req.body.title , req.body.post_content);
    await PostRepository.addPostWithGroup(userId, req.body.title , req.body.post_content, +req.body.id_group);
    res.status(200).json({});
  }));
  
export default postController;