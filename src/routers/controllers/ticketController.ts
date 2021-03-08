import express from 'express';
import { ITicket } from './../../entities/ITicket'
import { IProduct } from './../../entities/IProduct'
import * as CSV from 'csv-string';
import { database } from './../../database/utils'

const arr = CSV.parse('a,b,c\na,b,c');

const router: express.Router = express.Router();;
const dbutils: database = new database();

async function parseTicketData(rawData: string): Promise<ITicket> {
   let ticket: ITicket = { orderNumber: 0, vat: 0, total: 0 };
   const arrTicket: string[] = rawData.split(/\n/);
   arrTicket.forEach((data: string) => {
      if (data.startsWith('Order')) {
         ticket.orderNumber = parseInt(data.replace('Order:', '').trim());
      } else if (data.startsWith('VAT')) {
         ticket.vat = parseFloat(data.replace('VAT:', '').trim());
      } else if (data.startsWith('Total')) {
         ticket.total = parseFloat(data.replace('Total:', '').trim());
      } else {
         // we dont want to loose any ticket, so we return a 0 values ticket with an info of non conform ticket
         ticket.info = 'Non conform ticket, data missing'
      }
   })

   return ticket;
}

async function parseProductData(rawData: string): Promise<IProduct[]> {
   const arrProduct = CSV.parse(rawData);
   const products: IProduct[] = [];
   arrProduct.forEach((data: string[]): void => {
      if (!data.includes('product') && !data.includes('product_id') && !data.includes('price')) {
         products.push({ id: data[1], name: data[0], price: parseFloat(data[2]) });
      }
   });

   return products;
}

const ticketController: express.RequestHandler = async (req: express.Request, res: express.Response) => {
   try {
      if (typeof req.body === 'string') {
         const arrBody: string[] = req.body.split(/\n\n/);
         const ticket: ITicket = await parseTicketData(arrBody[0]);
         const products: IProduct[] = await parseProductData(arrBody[1]);
         const insertedTicketID: number = await dbutils.insertTicket(ticket);
         if (products.length > 0) {
            const insertedProductsIds: string[] = await dbutils.insertProduct(products);
            await dbutils.insertProductTicket(insertedTicketID, insertedProductsIds);
         }

         res.status(200).json('Insertion done with succes');
      }
   } catch (error) {
      console.log(error);

      return res.sendStatus(500);
   }

};

router.post('/', ticketController);

export default router;