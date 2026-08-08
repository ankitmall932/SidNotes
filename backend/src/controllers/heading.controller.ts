import type { NextFunction, Request, Response } from "express";
import Heading from "../models/heading.model.js";
import type { REPLCommand } from "node:repl";

export const createHeading = async ( req: Request, res: Response, next: NextFunction ): Promise<void> =>
{
    try
    {
        const userId = req.user._id;
        const topicId = req.params.id;
        const { heading, body } = req.body;
        const existingHeadings = await Heading.findOne( { heading, topic: topicId, user: userId } );
        if ( existingHeadings )
        {
            res.status( 400 ).json( {
                message: 'The given heading is already present in this topic.'
            } );
            return;
        }
        const newHeading = await Heading.create( {
            heading,
            body,
            user: userId,
            topic: topicId
        } );
        res.status( 201 ).json( {
            message: 'Heading Created Successfully',
            newHeading
        } );
    } catch ( err )
    {
        next( err );
    }
};

export const getHeading = async ( req: Request, res: Response, next: NextFunction ): Promise<void> =>
{
    try
    {
        const userId = req.user._id;
        const topicId = req.params.id;
        const headings = await Heading.find( { user: userId, topic: topicId } );
        if ( !headings || headings.length === 0 )
        {
            res.status( 404 ).json( {
                message: 'No headings found for the chosen topic'
            } );
            return;
        }
        res.status( 200 ).json( {
            message: 'Here is your headings',
            headings
        } );
    } catch ( err )
    {
        next( err );
    }
};

export const getDetailHeading = async ( req: Request, res: Response, next: NextFunction ): Promise<void> =>
{
    try
    {
        const headingId = req.params.id;
        const userId = req.user._id;
        const heading = await Heading.findOne( { _id: headingId, user: userId } );
        if ( !heading )
        {
            res.status( 404 ).json( {
                message: 'No Heading found'
            } );
            return;
        }
        res.status( 200 ).json( {
            message: 'This is your Heading',
            headings: heading
        } );
    } catch ( err )
    {
        next( err );
    }
};

export const editHeading = async ( req: Request, res: Response, next: NextFunction ): Promise<void> =>
{
    try
    {
        const headingId = req.params.id;
        const userId = req.user._id;
        const { heading, body } = req.body;
        const preHeading = await Heading.findOne( { _id: headingId, user: userId } );
        if ( !preHeading )
        {
            res.status( 404 ).json( {
                message: 'Heading Not found'
            } );
            return;
        }
        preHeading.heading = heading;
        preHeading.body = body;
        await preHeading.save();
        res.status( 201 ).json( {
            message: 'Heading updated successfully.',
            headings: preHeading
        } );
    } catch ( err )
    {
        next( err );
    }
};

export const deleteHeading = async ( req: Request, res: Response, next: NextFunction ): Promise<void> =>
{
    try
    {
        const headingId = req.params.id;
        const userId = req.user._id;
        const deleted = await Heading.findOneAndDelete( { _id: headingId, user: userId } );
        if ( !deleted )
        {
            res.status( 404 ).json( {
                message: 'Heading not found'
            } );
            return;
        }
        res.json( { message: 'Heading deleted successfully' } );
    } catch ( err )
    {
        next( err );
    }
};

export const completedHeading = async ( req: Request, res: Response, next: NextFunction ): Promise<void> =>
{
    try
    {
        const headingId = req.params.id;
        const userId = req.user._id;
        const headingCompleted = await Heading.findOne( { _id: headingId, user: userId } );
        if ( !headingCompleted )
        {
            res.status( 404 ).json( {
                message: 'Heading not found'
            } );
            return;
        }
        headingCompleted.completed = !headingCompleted.completed;
        await headingCompleted.save();
        res.status( 200 ).json( {
            message: 'Heading Completed',
            headingCompleted
        } );
    } catch ( err )
    {
        next( err );
    }
};
