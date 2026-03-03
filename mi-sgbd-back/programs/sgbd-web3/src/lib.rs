use anchor_lang::prelude::*;

// Tu Program ID oficial y permanente para este proyecto
declare_id!("HFZem2x9kmBtxNmAxHWb6MigiHjGEKV8maGYsMtgiSm9");

#[program]
pub mod sgbd_web3 {
    use super::*;

    // CREATE: Equivalente a un INSERT INTO
    pub fn insertar_registro(
        ctx: Context<InsertarRegistro>,
        clave: String,
        valor: String,
    ) -> Result<()> {
        let registro = &mut ctx.accounts.registro;

        // Guardamos quién es el dueño, la llave (ej. "temperatura") y el valor (ej. "180C")
        registro.owner = ctx.accounts.usuario.key();
        registro.clave = clave;
        registro.valor = valor;

        msg!("SGBD: Registro insertado exitosamente en la blockchain.");
        Ok(())
    }

    // UPDATE: Equivalente a un UPDATE WHERE
    pub fn actualizar_registro(
        ctx: Context<ActualizarRegistro>,
        nuevo_valor: String,
    ) -> Result<()> {
        let registro = &mut ctx.accounts.registro;
        registro.valor = nuevo_valor;

        msg!("SGBD: Registro actualizado.");
        Ok(())
    }

    // DELETE: Equivalente a un DROP o DELETE
    pub fn borrar_registro(_ctx: Context<BorrarRegistro>) -> Result<()> {
        msg!("SGBD: Registro eliminado y memoria liberada.");
        Ok(())
    }
}

// --- ESTRUCTURAS DE VALIDACIÓN Y PDAs ---

#[derive(Accounts)]
#[instruction(clave: String)] // Pasamos la clave como parámetro para generar la dirección única (PDA)
pub struct InsertarRegistro<'info> {
    #[account(mut)]
    pub usuario: Signer<'info>,

    // Aquí nace tu SGBD: Generamos una dirección única basada en la palabra "registro", la wallet del usuario y la clave del dato.
    #[account(
        init,
        payer = usuario,
        space = 8 + 32 + (4 + 50) + (4 + 200), // Espacio en memoria reservado para el dato
        seeds = [b"registro", usuario.key().as_ref(), clave.as_bytes()],
        bump
    )]
    pub registro: Account<'info, ModeloRegistro>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(clave: String)]
pub struct ActualizarRegistro<'info> {
    pub usuario: Signer<'info>,

    #[account(
        mut,
        seeds = [b"registro", usuario.key().as_ref(), clave.as_bytes()],
        bump,
        constraint = registro.owner == usuario.key() // CORRECCIÓN: Validación manual de seguridad
    )]
    pub registro: Account<'info, ModeloRegistro>,
}

#[derive(Accounts)]
#[instruction(clave: String)]
pub struct BorrarRegistro<'info> {
    pub usuario: Signer<'info>,

    #[account(
        mut,
        close = usuario, // Destruye la cuenta y devuelve la fracción de SOL al usuario
        seeds = [b"registro", usuario.key().as_ref(), clave.as_bytes()],
        bump,
        constraint = registro.owner == usuario.key() // CORRECCIÓN: Validación manual de seguridad
    )]
    pub registro: Account<'info, ModeloRegistro>,
}

// --- EL ESQUEMA DE TU BASE DE DATOS ---

#[account]
pub struct ModeloRegistro {
    pub owner: Pubkey,
    pub clave: String,
    pub valor: String,
}
