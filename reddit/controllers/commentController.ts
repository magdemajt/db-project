import express from 'express';
import asyncWrapper from 'common/asyncWrapper';
import db from 'dbConnection';

class ValueRow{
    id_comments: number;
    value: number | null;

    constructor(id_comments: number, val: number | null){
        this.id_comments = id_comments;
        this.value = val;
    }

    static fromJson(json: any): ValueRow{
        return new ValueRow(
            json.id_comments,
            json.sum
        )
    }
}

interface ICommentController {
    getComments(id_posts: number): 
    Promise<{
        id: number, 
        value: number,
        id_users: number,
        name: string,
        comment_content: string,
        created_at: string
    }[]> ;
    getLikeResult(id_comments: number): Promise<number>;
    addComment(id_posts: number, id_users: number, comment_content: string): Promise<boolean>;
    getLikeResultWithUser(id_users: number): Promise<ValueRow[]>;
    insertVote(id_comments: number, id_users: number, value: number): Promise<void>;
    updateVote(id_comments: number, id_users: number, value: number): Promise<void>;
}

const CommentRepository: ICommentController = {
    async getComments(id_posts: number):         
        Promise<{
            id: number, 
            value: number,
            id_users: number,
            name: string,
            comment_content: string,
            created_at: string
        }[]> {
            const result = await db.query(
                `SELECT c.id, sum(coalesce(cv.value, 0)) as value, c.id_users, u.name, c.comment_content, c.created_at FROM comments c
                INNER JOIN comments_in_posts cip ON c.id = cip.id_comments
                INNER JOIN users u ON c.id_users = u.id
                LEFT JOIN comments_votes cv ON c.id = cv.id_comments
                WHERE cip.id_posts = $1
                GROUP BY c.id, c.id, c.id_users, u.name, c.comment_content, c.created_at;`,
                [id_posts]
            );
            return result.rows;
    },
    async getLikeResult(id_comments: number): Promise<number>{
        const result = await db.query(
            `SELECT coalesce(sum(value), 0) AS sum FROM comments_votes
            WHERE id_comments = $1;`,
            [id_comments]
        );
        // console.log(result)
        return result.rows[0];
    },
    async addComment(id_posts: number, id_users: number, comment_content: string):
    Promise<boolean> {
        console.log(id_posts, id_users, comment_content);
        const result = await db.query(
            `INSERT INTO comments (id_users, comment_content)
            VALUES ($1, $2);`,
            [id_users, comment_content]
        );
        const result_id = await db.query(
            `SELECT id 
            from comments 
            where id_users = $1 and comment_content = $2;`,
            [id_users, comment_content]
        );
        if(!result_id){
            console.log("Cannot fetch data from database.");
        }
        console.log(result_id.rows[0].id)
        const result2 = await db.query(
            `INSERT INTO comments_in_posts (id_posts, id_comments)
            VALUES ($1, $2);`,
            [id_posts, result_id.rows[0].id]
        );
        // console.log(result);
        return true;
    },
    async getLikeResultWithUser(id_users: number): Promise<ValueRow[]>{
        const result = await db.query(
            `SELECT id_comments, value AS sum FROM comments_votes
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
    async insertVote(id_comments: number, id_users: number, value: number): Promise<void>{
        const res = await db.query(
            `SELECT * FROM comments_votes
            WHERE id_comments = $1 and id_users = $2;`,
                [id_comments, id_users]
        );
        if(res.rows.length != 0){
            return;
        }
        await db.query(
            `INSERT INTO comments_votes (id_comments, id_users, value)
            VALUES ($1, $2, $3);`,
            [id_comments, id_users, value]
        );
        return;
    },
    async updateVote(id_comments: number, id_users: number, value: number): Promise<void>{
        const res = await db.query(
            `SELECT * FROM comments_votes
            WHERE id_comments = $1 and id_users = $2;`,
                [id_comments, id_users]
        );
        if(res.rows.length == 0){
            return;
        }
        await db.query(
            `update comments_votes
            SET value = $3
            where id_comments = $1 and id_users = $2;`,
            [id_comments, id_users, value]
        );
        return;
    }
}

const commentController = express.Router();

commentController.get('/commentsForPost/:id_posts', asyncWrapper(async (req, res) => {
    const val = await CommentRepository.getComments(parseInt(req.params.id_posts));
    res.status(200).json({
      value: val
    });
  }));


  commentController.post('/insertVote', asyncWrapper(async (req, res) => {
    const userId = +req.session.user?.id;
    await CommentRepository.insertVote(+req.body.id_comments, userId, +req.body.value);
    res.status(200).json({});
  }));

  commentController.post('/updateVote', asyncWrapper(async (req, res) => {
    const userId = +req.session.user?.id;
    await CommentRepository.updateVote(+req.body.id_comments, userId, +req.body.value);
    res.status(200).json({});
  }));

  commentController.get('/likeResultUser', asyncWrapper(async (req, res) => {
    // console.log("inside post");
    const val = await CommentRepository.getLikeResultWithUser(
        parseInt(req.session.user?.id));

    res.status(200).json({
      value: val
    });

  }));

  commentController.post('/addComment', asyncWrapper(async (req, res) => {
    const userId = +req.session.user?.id;
    console.log(req.body.comment_content);
    console.log(+req.body.id_posts);
    await CommentRepository.addComment(+req.body.id_posts, userId, req.body.comment_content)
    res.status(200).json({});
  }));

export default commentController;