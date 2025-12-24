"use server"
import Event from "@/database/event.model"
import { connectDB } from "../mongodb";

export const GetSimilarEventsBySlug = async (slug: string) => {
    try {
        await connectDB();
        const event = await Event.findOne({ slug });
        let similarEvents =  await Event.find({ _id:{ $ne: event?._id }, tags:{ $in: event?.tags } }).lean();
        
        // If no similar events found, return up to 3 recent events excluding current
        if (similarEvents.length === 0) {
            similarEvents = await Event.find({ _id:{ $ne: event?._id } }).sort({ createdAt: -1 }).limit(3);
        }
        
        return similarEvents;
        
    } catch (error) {
        return [];
    }
}