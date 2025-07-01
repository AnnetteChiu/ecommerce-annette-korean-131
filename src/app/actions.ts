'use server';

export async function convertImageUrlToDataUri(imageUrl: string): Promise<string> {
    try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
            // This will be caught by the client and shown in the toast.
            throw new Error(`Failed to fetch product image: ${response.statusText}`);
        }
        const blob = await response.blob();
        const buffer = Buffer.from(await blob.arrayBuffer());
        const dataUri = `data:${blob.type};base64,${buffer.toString('base64')}`;
        return dataUri;
    } catch (error) {
        console.error("Error converting image URL to data URI:", error);
        // Re-throw a more user-friendly error.
        throw new Error("Could not process the product image. Please try another item.");
    }
}
