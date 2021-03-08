import { Pool, PoolClient } from 'pg';
import { ITicket } from '../entities/ITicket';
import { IProduct } from '../entities/IProduct';

export class database {
    private pool: Pool;

    constructor() {
        this.pool = new Pool();
    };

    public async insertTicket(ticket: ITicket): Promise<number> {
        const client: PoolClient = await this.pool.connect();
        try {
            const values: (string|number|null)[] = [ ticket.orderNumber, ticket.vat, ticket.total, ticket.info ? ticket.info : null ];
            const query: string = `INSERT INTO ticket (ordernumber, vat, total, metadata) VALUES ($1, $2, $3, $4)
            ON CONFLICT (ordernumber) DO UPDATE SET ordernumber = EXCLUDED.ordernumber
            RETURNING id`;
            const insertedId: number = await (await client.query(query, values)).rows[0].id;

            return insertedId;
        } catch (error) {
            throw error;
        } finally {
            client.release();
        }
    }

    public async insertProduct(products: IProduct[]): Promise<string[]> {
        const client: PoolClient = await this.pool.connect();
        try {
            // a workaround to handle pg tool syntax for a multi rows insertion
            const values: string = products.map((product: IProduct): string  => {
                return `('${product.id}', '${product.name}', ${product.price})`;
            }).join(',');
            // not the best way, can be weak against SQL injection
            const query: string = `INSERT INTO product (id, productname, price) VALUES ${values}
            ON CONFLICT (id) DO UPDATE SET id = EXCLUDED.id
            RETURNING id`;
            const insertedIds: string[] = await (await client.query(query)).rows.map((row: any) => {
                return row.id;
            });

            return insertedIds;
        } catch (error) {
            throw error;
        } finally {
            client.release();
        }
    }

    public async insertProductTicket(ticketId: number, productIds: string[]): Promise<void> {
        const client: PoolClient = await this.pool.connect();
        try {
            // a workaround to handle pg tool syntax for a multi rows insertion
            const values: string = productIds.map((id: string): string  => {
                return `('${id}', ${ticketId})`;
            }).join(',');
            // not the best way, can be weak against SQL injection
            const query: string = `INSERT INTO product_ticket (product_id, ticket_id) VALUES ${values}`;
            await client.query(query);
        } catch (error) {
            throw error;
        } finally {
            client.release();
        }
    }
}