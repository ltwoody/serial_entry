import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

interface JobRecord {
  u_id: string;
  serial_number: string;
  received_date: Date;
  supplier: string;
  date_receipt: Date;
  product_code: string;
  brand_name: string;
  job_no: string;
  product_name: string;
  replace_serial: string;
  count_round: number;
  rowuid: string;
  condition: string;
  remark: string;
  create_by: string;
  update_by: string;
}

export async function GET(req: NextRequest) {
  try {
    // Parse query parameters from the request URL
    const { searchParams } = new URL(req.url);
    const filters: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      filters[key] = value;
    }

    // Construct the query string to pass to the /api/jobs endpoint
    const query = new URLSearchParams(filters).toString();
    const jobsApiUrl = `${req.nextUrl.origin}/api/jobs${query ? `?${query}` : ''}`;

    // Fetch data from the /api/jobs endpoint
    const response = await fetch(jobsApiUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching data from /api/jobs:', errorText);
      return NextResponse.json({ error: 'Failed to fetch job data from internal API' }, { status: response.status });
    }

    const records: JobRecord[] = await response.json();

    // Ensure date fields are Date objects if they come as strings from API
    // This is important for ExcelJS to format dates correctly
    const processedRecords = records.map(record => ({
      ...record,
      received_date: record.received_date ? new Date(record.received_date) : record.received_date,
      date_receipt: record.date_receipt ? new Date(record.date_receipt) : record.date_receipt,
    }));

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Job Report');

    // Define columns for the worksheet
    worksheet.columns = [

      { header: 'Received Date', key: 'received_date', width: 15, style: { numFmt: 'yyyy-mm-dd' } },
      { header: 'Serial Number', key: 'serial_number', width: 25 },
      { header: 'Replace Serial', key: 'replace_serial', width: 25 },
      { header: 'Condition', key: 'condition', width: 30 },
      { header: 'Remark', key: 'remark', width: 30 },
      { header: 'Date Receipt', key: 'date_receipt', width: 15, style: { numFmt: 'yyyy-mm-dd' } },
      { header: 'Supplier', key: 'supplier', width: 20 },
      { header: 'Job No.', key: 'job_no', width: 15 },
      { header: 'Brand Name', key: 'brand_name', width: 20 },
      { header: 'Product Code', key: 'product_code', width: 15 },
      { header: 'Product Name', key: 'product_name', width: 30 },
      { header: 'Count Round', key: 'count_round', width: 15 },
      { header: 'Create By', key: 'create_by', width: 30 },
      { header: 'Update By', key: 'update_by', width: 30 },
    ];

    // Add rows to the worksheet
    processedRecords.forEach(record => {
      worksheet.addRow({
        job_no: record.job_no,
        serial_number: record.serial_number,
        condition: record.condition,
        remark: record.remark,
        date_receipt: record.date_receipt,
        received_date: record.received_date,
        supplier: record.supplier,
        brand_name: record.brand_name,
        product_code: record.product_code,
        product_name: record.product_name,
        replace_serial: record.replace_serial,
        count_round: record.count_round,
        create_by: record.create_by,
        update_by: record.update_by,
      });
    });

    // Generate the Excel file as a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Set headers for the response to trigger a file download
    const headers = new Headers();
    headers.append('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.append('Content-Disposition', 'attachment; filename="job_report.xlsx"');

    // Return the Excel file as a response
    return new NextResponse(buffer, {
      status: 200,
      headers: headers,
    });

  } catch (error) {
    console.error('Error generating Excel report:', error);
    return NextResponse.json({ error: 'Failed to generate Excel report' }, { status: 500 });
  }
}
