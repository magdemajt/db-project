import express from 'express';
import asyncWrapper from 'common/asyncWrapper';
import db from 'dbConnection';

interface IGroupRepository {
  getGroups(userId: number) : Promise<{id: number, name: string}[]>;
  groupExists(name: string) : Promise<boolean>;
  createGroup(name: string) : Promise<number>;
  enter(groupId: number, userId: number) : Promise<void>;
  deEnter(groupId: number, userId: number) : Promise<void>;
}

const GroupRepository: IGroupRepository = {

  async groupExists(name: string): Promise<boolean> {
    const result = await db.query(
      `SELECT EXISTS (SELECT FROM groups WHERE name = $1)`,
      [name],
    );
    return result.rows[0].exists;
  },

  async getGroups(userId: number): Promise<{id: number, name: string}[]> {
    const result = await db.query(`
      SELECT id, name, x.id_groups is not null belongs
      FROM groups g
      LEFT JOIN 
      (
        SELECT id_groups
        FROM groups_participants
        WHERE id_users = $1
      ) x ON x.id_groups = g.id`, [userId]
    );
    return result.rows;
  },

  async createGroup(name: string): Promise<number> {
    const result = await db.query(
      `INSERT INTO groups(name) VALUES ($1) RETURNING id`,
      [name],
    );
    return result.rows[0].id;
  },

  async enter(groupId: number, userId: number) : Promise<void> {
    await db.query(
      `INSERT INTO groups_participants(id_groups, id_users) VALUES ($1, $2)`,
      [groupId, userId],
    );
    return;
  },

  async deEnter(groupId: number, userId: number) : Promise<void> {
    await db.query(
      `DELETE FROM groups_participants WHERE id_groups = $1 AND id_users = $2`,
      [groupId, userId],
    );
    return;
  }
}

const groupController = express.Router();

groupController.get('', asyncWrapper(async (req, res) => {
  const groups = await GroupRepository.getGroups(req.session.user?.id);
  res.status(200).json({
    groups: groups
  });
}));

groupController.post('/enter', asyncWrapper(async (req, res) => {
  const userId = +req.session.user?.id;
  await GroupRepository.enter(+req.body.groupId, userId);
  res.status(200).json({});
}));

groupController.post('/deenter', asyncWrapper(async (req, res) => {
  const userId = +req.session.user?.id;
  await GroupRepository.deEnter(+req.body.groupId, userId);
  res.status(200).json({});
}));

groupController.post('/register', asyncWrapper(async (req, res) => {
  if (!req.body.name) {
    res.status(400).json({
      message: 'Group name required',
    });
    return;
  }

  const ed = await GroupRepository.groupExists(req.body.name);
  if (ed) {
    res.status(400).json({
      message: 'Group already exists',
    });
    return;
  }

  const id = await GroupRepository.createGroup(req.body.name);

  res.status(200).json({
    name: req.body.name,
    id: id
  });
}));

export default groupController;
