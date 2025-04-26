import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userIds } = await request.json();

    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { error: 'Invalid user IDs' },
        { status: 400 }
      );
    }

    const users = await Promise.all(
      userIds.map(async (userId) => {
        try {
          const user = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
            headers: {
              Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
            },
          }).then(res => res.json());

          return [
            userId,
            user.username || user.first_name || user.email_addresses?.[0]?.email_address || 'Unknown User'
          ];
        } catch (error) {
          console.error(`Error fetching user ${userId}:`, error);
          return [userId, 'Unknown User'];
        }
      })
    );

    const userDataMap = Object.fromEntries(users);
    return NextResponse.json(userDataMap);
  } catch (error) {
    console.error('Error in getUsernames API:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 