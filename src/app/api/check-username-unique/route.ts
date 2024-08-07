import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { z } from "zod"
import { usernameValidation } from "@/schemas/signUpSchema"

const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {
   
    await dbConnect()
    // localhost:3000/api/cuu?username=hitesh?phone=android
    try {
        const { searchParams } = new URL(request.url)
        const queryParams = {
            username: searchParams.get("username")
        }
        // validate with zod
        const result = UsernameQuerySchema.safeParse(queryParams)

        console.log(result);

        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || []
            return Response.json({
                success: false,
                message: usernameErrors?.length > 0 ? usernameErrors.join(', ') : 'Invalid query Parameters'
            }, { status: 400 })
        }
        const { username } = result.data
        const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true })

        if(existingVerifiedUser){
            return Response.json({
                success: false,
                message:"Username is already taken"
            }, { status: 400 })
        }
        return Response.json({
            success: true,
            message:"Username is available"
        }, { status: 200 })


    } catch (err) {
        console.error("Error checking username...", err)
        return Response.json(
            {
                success: false,
                message: "Error checking username..."
            },
            { status: 500 }
        )
    }
}