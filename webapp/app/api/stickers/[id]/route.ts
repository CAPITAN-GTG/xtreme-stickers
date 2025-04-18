import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/utils/connectDB';
import Sticker from '@/models/Sticker';
import { deleteImage } from '@/utils/cloudinary';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const data = await request.json();

    const sticker = await Sticker.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true }
    );

    if (!sticker) {
      return NextResponse.json({ error: "Sticker not found" }, { status: 404 });
    }

    return NextResponse.json(sticker);
  } catch (error: any) {
    console.error('Error updating sticker:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update sticker' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing sticker ID" }, { status: 400 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const sticker = await Sticker.findOne({ _id: id, userId });

    if (!sticker) {
      return NextResponse.json({ error: "Sticker not found" }, { status: 404 });
    }

    let imageDeleted = false;
    if (sticker.imageUrl) {
      imageDeleted = await deleteImage(sticker.imageUrl);
      if (!imageDeleted) {
        console.error('Failed to delete image from Cloudinary:', sticker.imageUrl);
      }
    }

    await Sticker.findOneAndDelete({ _id: id, userId });

    return NextResponse.json({
      message: "Sticker deleted successfully",
      imageDeleted: imageDeleted
    });
  } catch (error: any) {
    console.error('Error deleting sticker:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete sticker' },
      { status: 500 }
    );
  }
}
