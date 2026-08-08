import type { NextFunction, Request, Response } from "express";
import Topic from "../models/topic.model.js";
import Heading from "../models/heading.model.js";


export const createTopics = async ( req: Request, res: Response, next: NextFunction ): Promise<void> =>
{
    try
    {
        const userId = req.user._id;
        const { topic } = req.body;
        const existingTopic = await Topic.findOne( { topic, user: userId } );
        if ( existingTopic )
        {
            res.status( 400 ).json( {
                message: 'The given topic is already is existed. Please choose another name or go to that topic'
            } );
            return;
        }
        const newTopic = await Topic.create( {
            topic,
            user: userId
        } );
        res.status( 201 ).json( {
            message: 'Topic created Successfully',
            newTopic
        } );
    } catch ( err )
    {
        next( err );
    }
};

export const getTopics = async ( req: Request, res: Response, next: NextFunction ): Promise<void> =>
{
    try
    {
        const userId = req.user._id;
        const topics = await Topic.find( { user: userId } );
        if ( !topics || topics.length === 0 )
        {
            res.status( 400 ).json( {
                message: 'No Topics found for the given user'
            } );
            return;
        }
        res.status( 200 ).json( {
            message: 'Topics Found for the Given User',
            topic: topics
        } );
    } catch ( err )
    {
        next( err );
    }
};

export const editTopic = async ( req: Request, res: Response, next: NextFunction ): Promise<void> =>
{
    try
    {
        const userId = req.user._id;
        const topicId = req.params.id;
        const { topic } = req.body;
        const oldTopic = await Topic.findOne( { _id: topicId, user: userId } );
        if ( !oldTopic )
        {
            res.status( 400 ).json( {
                message: 'No topic Found'
            } );
            return;
        }
        oldTopic.topic = topic;
        await oldTopic.save();
        res.status( 200 ).json( {
            message: 'Topic is updated successfully',
            topic: oldTopic
        } );
    } catch ( err )
    {
        next( err );
    }
};

export const deleteTopic = async ( req: Request, res: Response, next: NextFunction ): Promise<void> =>
{
    try
    {
        const userId = req.user._id;
        const topicId = req.params.id;
        const deleted = await Topic.findOneAndDelete( { _id: topicId, user: userId } );
        if ( !deleted )
        {
            res.status( 404 ).json( {
                message: 'Topic not found'
            } );
            return;
        }
        await Heading.deleteMany( { topic: topicId, user: userId } );
        res.json( { message: 'Topic deleted successfully' } );
    } catch ( err )
    {
        next( err );
    }
};

export const completeTopic = async ( req: Request, res: Response, next: NextFunction ): Promise<void> =>
{
    try
    {
        const userId = req.user._id;
        const topicId = req.params.id;
        const topic = await Topic.findOne( { _id: topicId, user: userId } );
        if ( !topic )
        {
            res.status( 404 ).json( {
                message: 'Topic not found'
            } );
            return;
        }
        topic.completed = !topic.completed;
        await topic.save();
        await Heading.updateMany( { topic: topicId, user: userId }, { completed: topic.completed } );
        res.status( 200 ).json( {
            message: 'Heading and notes updated successfully',
            topics: topic
        } );
    } catch ( err )
    {
        next( err );
    }
};
