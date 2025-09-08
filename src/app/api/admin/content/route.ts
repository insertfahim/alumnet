import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AuthenticatedRequest } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

async function handler(req: AuthenticatedRequest) {
    if (req.method === "GET") {
        return await handleGetContent(req);
    } else if (req.method === "DELETE") {
        return await handleDeleteContent(req);
    }

    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

async function handleGetContent(req: AuthenticatedRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const search = searchParams.get("search") || "";
        const type = searchParams.get("type") || "all";

        const skip = (page - 1) * limit;

        let content: any[] = [];

        // Fetch posts if type is "all" or "posts"
        if (type === "all" || type === "posts") {
            const posts = await prisma.post.findMany({
                where: search
                    ? {
                          OR: [
                              {
                                  content: {
                                      contains: search,
                                      mode: "insensitive",
                                  },
                              },
                              {
                                  author: {
                                      firstName: {
                                          contains: search,
                                          mode: "insensitive",
                                      },
                                  },
                              },
                              {
                                  author: {
                                      lastName: {
                                          contains: search,
                                          mode: "insensitive",
                                      },
                                  },
                              },
                          ],
                      }
                    : {},
                include: {
                    author: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                    _count: {
                        select: { comments: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            });

            content.push(
                ...posts.map((post) => ({
                    id: post.id,
                    type: "post" as const,
                    content: post.content,
                    authorName: `${post.author.firstName} ${post.author.lastName}`,
                    createdAt: post.createdAt.toISOString(),
                    hasImages: post.images.length > 0,
                    commentsCount: post._count.comments,
                }))
            );
        }

        // Fetch comments if type is "all" or "comments"
        if (type === "all" || type === "comments") {
            const comments = await prisma.comment.findMany({
                where: search
                    ? {
                          OR: [
                              {
                                  content: {
                                      contains: search,
                                      mode: "insensitive",
                                  },
                              },
                              {
                                  author: {
                                      firstName: {
                                          contains: search,
                                          mode: "insensitive",
                                      },
                                  },
                              },
                              {
                                  author: {
                                      lastName: {
                                          contains: search,
                                          mode: "insensitive",
                                      },
                                  },
                              },
                          ],
                      }
                    : {},
                include: {
                    author: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                    post: {
                        select: {
                            content: true,
                            author: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: type === "all" ? 0 : skip,
                take: type === "all" ? Math.floor(limit / 2) : limit,
            });

            content.push(
                ...comments.map((comment) => ({
                    id: comment.id,
                    type: "comment" as const,
                    content: comment.content,
                    authorName: `${comment.author.firstName} ${comment.author.lastName}`,
                    createdAt: comment.createdAt.toISOString(),
                    postId: comment.postId,
                    postAuthor: `${comment.post.author.firstName} ${comment.post.author.lastName}`,
                    postPreview:
                        comment.post.content.substring(0, 100) +
                        (comment.post.content.length > 100 ? "..." : ""),
                }))
            );
        }

        // Sort combined results by creation date
        content.sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        );

        // Apply pagination to combined results
        const paginatedContent = content.slice(0, limit);

        return NextResponse.json({
            content: paginatedContent,
            pagination: {
                page,
                limit,
                total: content.length,
            },
        });
    } catch (error) {
        console.error("Error fetching content:", error);
        return NextResponse.json(
            { error: "Failed to fetch content" },
            { status: 500 }
        );
    }
}

async function handleDeleteContent(req: AuthenticatedRequest) {
    try {
        const body = await req.json();
        const { id, type } = body;

        if (!id || !type) {
            return NextResponse.json(
                { error: "Missing required fields: id and type" },
                { status: 400 }
            );
        }

        if (type === "post") {
            // Delete post (comments will be deleted automatically due to cascade)
            await prisma.post.delete({
                where: { id },
            });
        } else if (type === "comment") {
            // Delete comment
            await prisma.comment.delete({
                where: { id },
            });
        } else {
            return NextResponse.json(
                { error: "Invalid type. Must be 'post' or 'comment'" },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting content:", error);
        if (
            error instanceof Error &&
            error.message.includes("Record to delete does not exist")
        ) {
            return NextResponse.json(
                { error: "Content not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: "Failed to delete content" },
            { status: 500 }
        );
    }
}

export const GET = requireAdmin(handler);
export const DELETE = requireAdmin(handler);
