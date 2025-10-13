import { resendClient, sender } from "../lib/resend.js";
import { createWellcomeEmailTemplate } from "./emialTemplates.js";


export const sendWelcomeEmail = async (email,name, clientUrl) =>{
    const {data ,error} = await resendClient.emails.send({
        from: `${sender.name} <${sender.email}>`,
        to: email,
        subject: "Welcome to Chatify!",
        html: createWellcomeEmailTemplate(name, clientUrl)
    });

    if(error){
        console.log("Error sending welcome email:", error);
        throw new Error("Failed to send welcome email");
    }

    console.log("Welcome email sent:", data);
}