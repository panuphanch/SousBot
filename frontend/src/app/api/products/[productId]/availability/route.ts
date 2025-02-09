import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId;
    const response = await fetch(`${process.env.BACKEND_API_URL}/api/products/${productId}/availability`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to update product availability');
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating product availability:', error);
    return NextResponse.json(
      { error: 'Failed to update product availability' },
      { status: 500 }
    );
  }
}