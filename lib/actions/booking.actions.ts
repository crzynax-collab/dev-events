"use server";
import Booking from "@/database/booking.model";
import connectDB from "@/lib/mongodb";

export const CreateBooking =  async({ eventId, slug , email}:{eventId:string, slug:string, email:string}) => {
     try {
        console.log("Creating booking with eventId:", eventId, "email:", email);
        await  connectDB();
        await Booking.create({ eventId, email });    
        console.log("Booking created successfully");
        return { success: true};
     } catch (error) {
         console.error("Error creating booking:", error);
         return{success:false};  
     }
} 