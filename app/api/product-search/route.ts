// File: /app/api/product-name/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust this path if needed

export async function POST(req: NextRequest) {
  try {
    const { product_code } = await req.json();

    // Basic validation for product_code
    if (!product_code || typeof product_code !== 'string' || product_code.trim() === '') {
      return NextResponse.json(
        { message: 'Invalid or missing product_code in request body' },
        { status: 400 }
      );
    }

    // Use Prisma to find the product by product_code
    // Assuming 'product_master' is represented by 'productMaster' model in Prisma schema
    const product = await prisma.productMaster.findUnique({
      where: {
        product_code: product_code, // Assuming product_code is unique
      },
      select: {
        product_name: true, // Select only the product_name field
      },
    });

    // If a product is found, return its name; otherwise, return an empty string
    if (product) {
      return NextResponse.json({ product_name: product.product_name }, { status: 200 });
    } else {
      return NextResponse.json({ product_name: '' }, { status: 200 });
    }
  } catch (error: any) {
    console.error('Error fetching product_name (POST):', error); // Added context to error message

    // You can add more specific Prisma error handling here if needed
    // For example, if product_code is not unique and you used findUnique,
    // Prisma might throw an error if multiple records match.
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query')?.trim();

    if (!query) {
      // If no query is provided, return an empty array of products
      return NextResponse.json({ products: [] }, { status: 200 });
    }

    // Use Prisma to search for products based on the query
    // This assumes 'product_master' is represented by 'productMaster' model in Prisma schema
    const products = await prisma.productMaster.findMany({
      where: {
        OR: [
          {
            product_code: {
              contains: query,
              mode: 'insensitive', // Equivalent to ILIKE for case-insensitive search
            },
          },
          {
            product_name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            brand_name: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        product_code: true,
        brand_name: true,
        product_name: true,
      },
      orderBy: {
        product_code: 'asc', // Order by product_code ascending
      },
      take: 50, // Limit to 50 results
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching product search results (GET):', error); // Added context to error message
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
