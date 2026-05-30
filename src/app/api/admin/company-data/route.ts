import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get or create CompanyData record
    let companyData = await db.companyData.findFirst();

    if (!companyData) {
      // Create default record if none exists
      companyData = await db.companyData.create({
        data: {
          thirdPartyScriptsEnabled: true,
        },
      });
    }

    // Return all fields
    const data = {
      thirdPartyScriptsEnabled: companyData.thirdPartyScriptsEnabled,
      googleAnalyticsId: companyData.googleAnalyticsId,
      facebookPixelId: companyData.facebookPixelId,
      amazonTagId: companyData.amazonTagId,
      adSenseId: (companyData as any).adSenseId || null,
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching company data:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // Get or create CompanyData record
    let companyData = await db.companyData.findFirst();

    if (!companyData) {
      // Create default record if none exists
      companyData = await db.companyData.create({
        data: {},
      });
    }

    // Update the company data
    const updatedData = await db.companyData.update({
      where: { id: companyData.id },
      data: {
        ...(body.thirdPartyScriptsEnabled !== undefined && {
          thirdPartyScriptsEnabled: body.thirdPartyScriptsEnabled,
        }),
        ...(body.adSenseId !== undefined && {
          adSenseId: body.adSenseId,
        }),
      },
    });

    const data = {
      thirdPartyScriptsEnabled: updatedData.thirdPartyScriptsEnabled,
      googleAnalyticsId: updatedData.googleAnalyticsId,
      facebookPixelId: updatedData.facebookPixelId,
      amazonTagId: updatedData.amazonTagId,
      adSenseId: (updatedData as any).adSenseId || null,
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error updating company data:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}