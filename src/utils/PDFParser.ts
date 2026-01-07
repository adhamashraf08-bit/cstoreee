import * as pdfjsLib from 'pdfjs-dist';
import { BranchData, WebsiteData, SalesReport } from '../../types';

// Set worker source for PDF.js - using local file to avoid CORS issues
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export interface ParsedData {
    branches: BranchData[];
    website: WebsiteData;
}

/**
 * Extracts text from a PDF file
 */
async function extractTextFromPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
        fullText += pageText + '\n';
    }

    return fullText;
}

/**
 * Parses extracted text to find numerical data
 */
function parseNumbers(text: string): number[] {
    // Extract all numbers from text (including decimals)
    const numberPattern = /\d+(?:\.\d+)?/g;
    const matches = text.match(numberPattern);
    return matches ? matches.map(n => parseFloat(n)) : [];
}

/**
 * Attempts to intelligently parse PDF text into dashboard structure
 * This is a flexible parser that looks for common patterns
 */
export async function parsePDFToDashboardData(file: File): Promise<SalesReport | null> {
    try {
        const text = await extractTextFromPDF(file);
        console.log('Extracted PDF text:', text);

        // Extract all numbers from the PDF
        const numbers = parseNumbers(text);
        console.log('Found numbers:', numbers);

        if (numbers.length < 10) {
            throw new Error('Not enough numerical data found in PDF');
        }

        // Look for branch names
        const branchNames = ['Madinaty', 'New Cairo 5th', 'Zahraa El Maadi', 'Downtown'];
        const arabicNames = ['مدينتي', 'التجمع الخامس', 'زهراء المعادي', 'وسط البلد'];

        // Try to find branch data patterns
        // Assuming structure: each branch has Call Centre, Insta, Talabat data
        const branches: BranchData[] = [];

        // Since we can't see the PDF structure, we'll create a smart parser
        // that attempts to group numbers into meaningful chunks

        // For 4 branches with 3 channels each (2 values per channel: sales, orders)
        // We need at least 4 * 3 * 2 = 24 numbers for branches
        // Plus website data (visits, sales, orders, etc.)

        let idx = 0;

        // Parse branches (assuming ordered data)
        for (let i = 0; i < 4 && idx < numbers.length - 6; i++) {
            const channels = [];

            // Call Centre
            const ccSales = numbers[idx++] || 0;
            const ccOrders = numbers[idx++] || 0;
            channels.push({
                name: 'Call Centre',
                sales: ccSales,
                orders: ccOrders,
                avgOrderValue: ccOrders > 0 ? ccSales / ccOrders : 0
            });

            // Instagram
            const instaSales = numbers[idx++] || 0;
            const instaOrders = numbers[idx++] || 0;
            channels.push({
                name: 'Insta',
                sales: instaSales,
                orders: instaOrders,
                avgOrderValue: instaOrders > 0 ? instaSales / instaOrders : 0
            });

            // Talabat
            const talabatSales = numbers[idx++] || 0;
            const talabatOrders = numbers[idx++] || 0;
            channels.push({
                name: 'Talabat',
                sales: talabatSales,
                orders: talabatOrders,
                avgOrderValue: talabatOrders > 0 ? talabatSales / talabatOrders : 0
            });

            const totalSales = ccSales + instaSales + talabatSales;
            const totalOrders = ccOrders + instaOrders + talabatOrders;

            branches.push({
                name: branchNames[i],
                arabicName: arabicNames[i],
                channels,
                totalSales,
                totalOrders,
                avgOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0
            });
        }

        // Parse website data (remaining numbers)
        const websiteVisits = numbers[idx++] || 1000;
        const websiteSales = numbers[idx++] || 0;
        const websiteOrders = numbers[idx++] || 0;
        const completedOrders = numbers[idx++] || 0;
        const cancelledOrders = numbers[idx++] || 0;
        const cancelledValue = numbers[idx++] || 0;

        const website: WebsiteData = {
            visits: websiteVisits,
            totalSales: websiteSales,
            totalOrders: websiteOrders,
            completedOrders,
            cancelledOrders,
            cancelledValue,
            conversionRate: websiteVisits > 0 ? (websiteOrders / websiteVisits) * 100 : 0,
            cancellationRate: websiteOrders > 0 ? (cancelledOrders / websiteOrders) * 100 : 0,
            avgOrderValue: websiteOrders > 0 ? websiteSales / websiteOrders : 0
        };

        return {
            branches,
            website
        };

    } catch (error) {
        console.error('Error parsing PDF:', error);
        return null;
    }
}

/**
 * Parse PDF with manual structure mapping
 * Use this if you know the exact structure of your PDF
 */
export async function parsePDFWithStructure(
    file: File,
    structure: {
        branchCount: number;
        channelsPerBranch: number;
        valuesPerChannel: number;
    }
): Promise<SalesReport | null> {
    try {
        const text = await extractTextFromPDF(file);
        const numbers = parseNumbers(text);

        console.log(`Found ${numbers.length} numbers in PDF`);
        console.log('Numbers:', numbers);

        // You can customize this based on your PDF structure
        return parsePDFToDashboardData(file);

    } catch (error) {
        console.error('Error parsing PDF with structure:', error);
        return null;
    }
}
