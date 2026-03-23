use anchor_lang::prelude::*;

declare_id!("HFZem2x9kmBtxNmAxHWb6MigiHjGEKV8maGYsMtgiSm9");

#[program]
pub mod sgbd_web3 {
    use super::*;

    pub fn create_collection(ctx: Context<CreateCollection>, name: String) -> Result<()> {
        let collection = &mut ctx.accounts.collection;
        collection.authority = ctx.accounts.authority.key();
        collection.name = name;
        collection.record_count = 0; 
        Ok(())
    }

    pub fn insert_record(ctx: Context<InsertRecord>, content_hash: String) -> Result<()> {
        let collection = &mut ctx.accounts.collection;
        let db_record = &mut ctx.accounts.db_record;

        db_record.collection = collection.key();
        db_record.authority = ctx.accounts.authority.key();
        db_record.content_hash = content_hash; 
        db_record.id = collection.record_count;

        collection.record_count += 1;
        Ok(())
    }

    pub fn update_record(ctx: Context<UpdateRecord>, new_content_hash: String) -> Result<()> {
        let db_record = &mut ctx.accounts.db_record;
        db_record.content_hash = new_content_hash;
        Ok(())
    }

    pub fn delete_record(_ctx: Context<DeleteRecord>) -> Result<()> {
        Ok(())
    }

    // NUEVO: Eliminar la Colección entera
    pub fn delete_collection(_ctx: Context<DeleteCollection>) -> Result<()> {
        // La cuenta se cierra y transfiere los SOL gracias a la macro `close`
        Ok(())
    }
}

// --- ESTRUCTURAS ---

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateCollection<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 4 + 50 + 8,
        seeds = [b"collection", authority.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub collection: Account<'info, Collection>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(content_hash: String)]
pub struct InsertRecord<'info> {
    #[account(mut, has_one = authority)]
    pub collection: Account<'info, Collection>,
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 4 + 64 + 8,
        seeds = [b"record", collection.key().as_ref(), &collection.record_count.to_le_bytes()],
        bump
    )]
    pub db_record: Account<'info, DbRecord>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateRecord<'info> {
    #[account(mut, has_one = authority)]
    pub db_record: Account<'info, DbRecord>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteRecord<'info> {
    #[account(mut, has_one = authority, close = authority)]
    pub db_record: Account<'info, DbRecord>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

// NUEVO: Estructura para eliminar la colección
#[derive(Accounts)]
pub struct DeleteCollection<'info> {
    #[account(mut, has_one = authority, close = authority)]
    pub collection: Account<'info, Collection>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[account]
pub struct Collection {
    pub authority: Pubkey,
    pub name: String,     
    pub record_count: u64,
}

#[account]
pub struct DbRecord {
    pub collection: Pubkey,  
    pub authority: Pubkey,   
    pub content_hash: String,
    pub id: u64,             
}