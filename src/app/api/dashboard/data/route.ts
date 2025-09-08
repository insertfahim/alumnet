import { NextRequest, NextResponse } from "next/server";  
import { requireAuth, AuthenticatedRequest } from "@/lib/middleware/auth";  
import { prisma } from "@/lib/prisma"; 
  
interface Activity {  
    id: string;  
