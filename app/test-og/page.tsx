import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Test Open Graph - mahr.fyi',
  description: 'Testing Open Graph metadata for iMessage previews',
  openGraph: {
    title: 'Test Open Graph - mahr.fyi',
    description: 'Testing Open Graph metadata for iMessage previews',
    images: ['/og-image.png'],
  },
}

export default function TestOGPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Open Graph Test Page</h1>
      <p className="mb-4">
        This page is set up to test Open Graph metadata for iMessage previews.
      </p>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">How to test:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Copy this page URL: <code className="bg-gray-100 px-2 py-1 rounded">https://mahr.fyi/test-og</code></li>
          <li>Open iMessage on your iPhone</li>
          <li>Paste the URL in a message</li>
          <li>You should see a preview with the mahr.fyi image and description</li>
        </ol>
      </div>
      
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Expected Preview:</h3>
        <ul className="space-y-1 text-sm">
          <li>• Title: "Test Open Graph - mahr.fyi"</li>
          <li>• Description: "Testing Open Graph metadata for iMessage previews"</li>
          <li>• Image: The mahr.fyi Open Graph image (1200x630px)</li>
        </ul>
      </div>
    </div>
  )
} 