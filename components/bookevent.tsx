"use client"
import { CreateBooking } from "@/lib/actions/booking.actions";
import posthog from "posthog-js";
import { useState } from "react";
const Bookevent = ({ eventId, slug }: { eventId: string; slug: string   }) =>{
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const HandleSubmit = async (e: React.FormEvent) =>{
        e.preventDefault();
        if (!email.trim()) {
            alert("Please enter a valid email address");
            return;
        }
        console.log("PostHog loaded:", posthog.__loaded);
    const {success } = await CreateBooking({ eventId, slug, email}); 

    if(success){
        setSubmitted(true);
        console.log("Booking successful, capturing event");
        console.log("Capturing PostHog event: book_event with", { eventId, slug, email });
        posthog.capture("book_event", {
            eventId,
            slug,
            email,
        });
        console.log("PostHog capture called");
    }else{
        console.error("Booking failed:");
        posthog.captureException("Booking creation failed")
    }

         setTimeout(() => {
            setSubmitted(true);
         }, 1000);
    }
    return(
        <div id="book-event">
        {submitted?(
            <p className="text-sm">Thank you for booking an event!</p>
        ):(
            <form onSubmit={HandleSubmit}>
            <div>
            <label htmlFor="email">Email address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} 
            id="email"
            placeholder="Enter your email address"/>
            </div>
            <button type="submit" className="button-submit" >submit</button>
            </form>
        ) }
        </div>
    )
}

export default Bookevent;