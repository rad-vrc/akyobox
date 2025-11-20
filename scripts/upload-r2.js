
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const key = url.pathname.slice(1); // Remove leading slash

        // GET: Retrieve file or list bucket
        if (request.method === "GET") {
            if (!key) {
                const list = await env.R2_BUCKET.list();
                const keys = list.objects.map(o => o.key).join("\n");
                return new Response(`Files in bucket:\n${keys}`);
            }

            const object = await env.R2_BUCKET.get(key);
            if (!object) return new Response("Object not found", { status: 404 });

            const headers = new Headers();
            object.writeHttpMetadata(headers);
            headers.set("etag", object.httpEtag);

            if (key.endsWith(".mp4")) {
                headers.set("Content-Type", "video/mp4");
            }

            return new Response(object.body, { headers });
        }

        // POST: Multipart actions
        if (request.method === "POST") {
            const action = url.searchParams.get("action");
            const uploadId = url.searchParams.get("uploadId");

            if (action === "mp-init") {
                if (!key) return new Response("Key required", { status: 400 });
                const multipartUpload = await env.R2_BUCKET.createMultipartUpload(key);
                return new Response(JSON.stringify({ uploadId: multipartUpload.uploadId }));
            }

            if (action === "mp-complete") {
                if (!key || !uploadId) return new Response("Key and uploadId required", { status: 400 });
                const parts = await request.json(); // Expects array of { partNumber, etag }
                const multipartUpload = env.R2_BUCKET.resumeMultipartUpload(key, uploadId);
                await multipartUpload.complete(parts);
                return new Response("Upload completed");
            }
        }

        // PUT: Upload part or file
        if (request.method === "PUT") {
            const action = url.searchParams.get("action");
            const uploadId = url.searchParams.get("uploadId");
            const partNumber = parseInt(url.searchParams.get("partNumber"));

            if (action === "mp-part") {
                if (!key || !uploadId || !partNumber) return new Response("Key, uploadId, and partNumber required", { status: 400 });
                const multipartUpload = env.R2_BUCKET.resumeMultipartUpload(key, uploadId);
                const part = await multipartUpload.uploadPart(partNumber, request.body);
                return new Response(JSON.stringify({ partNumber, etag: part.etag }));
            }

            // Fallback: Single file upload
            if (!key) return new Response("Key required", { status: 400 });
            await env.R2_BUCKET.put(key, request.body);
            return new Response(`Uploaded ${key} successfully!`);
        }

        return new Response("Invalid request", { status: 400 });
    },
};
