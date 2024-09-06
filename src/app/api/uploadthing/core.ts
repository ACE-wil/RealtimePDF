import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import {OpenAIEmbeddings} from "langchain/embeddings/openai"
import {PineconeStore} from "langchain/vectorstores/pinecone"
import { getPineconeClient } from "@/lib/pinecone";

 
const f = createUploadthing();


export const ourFileRouter = {

  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const {getUser} = getKindeServerSession()
      const user = getUser()

      if(!user || !(await user).id) throw new Error("Not Authenticated")
      
        return {userId: (await user).id};

    })
    .onUploadComplete(async ({ metadata, file }) => {
      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: `https://utfs.io/f/${file.key}`,
          uploadStatus: 'PROCESSING'
        }
      })

      try {
        const response = await fetch(`https://utfs.io/f/${file.key}`)
        const blob = await response.blob()

        const loader = new PDFLoader(blob)

        const pageLevelDocs = await loader.load()

        const pagesAmt = pageLevelDocs.length

        const pinecone = await getPineconeClient()
        const pineconeIndex = pinecone.Index("shen")

        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
        })

        await PineconeStore.fromDocuments(
          pageLevelDocs, 
          embeddings, 
          {
          pineconeIndex,
          namespace: createdFile.id
        }
      )

      await db.file.update({
        data: {
          uploadStatus: 'SUCCESS',
        },
        where: {
          id: createdFile.id
        }
      })
      } catch (err) {
        await db.file.update({
          data: {
            uploadStatus: 'FAILD',
          },
          where: {
            id: createdFile.id
          }
        })
      }

    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;