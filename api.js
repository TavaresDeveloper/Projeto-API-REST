const express = require('express');

const mysql2 = require('mysql2/promise');

require('dotenv').config();


const api = express();
api.use(express.json());
const port = 3000;

    const dbConfig = {
      
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,

    };
    

    api.get('/atendimento', async(req, res) =>{
         
          try{
            const connection = await mysql2.createConnection(dbConfig);

             const[rows] = await connection.execute(`
                  Select funcionario.funcionarioID, funcionario.funcionarioCargo, funcionario.funcionarioNome, cliente.clienteID,cliente.ClienteNome, atendimento.atendimentoStatus, atendimento.atendimentoID
                  from funcionario inner join atendimento on funcionario.funcionarioID =
                  atendimento.funcionarioID inner join cliente on cliente.clienteID =
                   atendimento.clienteID;
                
                  `);

               await connection.end();

               const atendimentoMap = {};
               rows.forEach(row => {
                     
                if(!atendimentoMap[row.funcionarioID]){
                      atendimentoMap[row.funcionarioID] = {
                          
                          funcionarioID: row.funcionarioID,
                          funcionarioNome: row.funcionarioNome, 
                           funcionarioCargo: row.funcionarioCargo,
                           atendimento: []
                           };


                }
                    
                   if(row.atendimentoID){
                        
                    atendimentoMap[row.funcionarioID].atendimento.push({
                                 
                         atendimentoID: row.atendimentoID,
                         atendimentoStatus: row.atendimentoStatus,
                         clienteID: row.clienteID,
                         ClienteNome: row.ClienteNome,
                         funcionarioID: row.funcionarioID,
                         funcionarioNome: row.funcionarioNome
                    });


                   }
                
               });
               
            res.json(Object.values(atendimentoMap));
          }catch(error){

                       console.error('Erro ao processar requisição', error.message);
                              res.status(500).json({ error: 'Erro ao acessar o banco de dados' });
             
            
           }
          
           
          
            
});

api.put('/atendimentoUpdate/:atendimentoID', async(req, res) => {
      const{atendimentoID} = req.params;
      const{atendimentoStatus} = req.body;

      try{

        const connection = await mysql2.createConnection(dbConfig);

        const[resultado] = await connection.execute(`update atendimento set
          atendimentoStatus = ? where atendimentoID = ?`, [atendimentoStatus, atendimentoID]);

          await connection.end();

          if((!resultado.affectedRows) === 0){

              res.status(404).json({message: "Sessão de atendimento não encontrada"});

          }

          res.status(200).json({message: "Sessão de atendimento atualizada."});


      }catch(error){

          console.error("Falha ao processar requisição", error.message);
          res.status(500).json({message: "Falha ao conectar com o banco de dados"});



      }





});

api.post('/atendimentoRecente', async(req, res)=> {
      const{atendimentoStatus, funcionarioID, clienteID,} = req.body;

      try{
          const connection = await mysql2.createConnection(dbConfig);
          
          const[rows] = await connection.execute(`insert into atendimento(funcionarioID,
            clienteID, atendimentoStatus) values(?, ?, ?)`, [funcionarioID, clienteID, atendimentoStatus]); 
              
            await connection.end();

        res.status(200).json({message: "Novo atendimento realizado com sucesso"});

      }catch(error){

        console.error("Falha ao processar requisição!", error.message);
        res.status(500).json({message: "Falha ao conectar com o banco de dados!"});

      }


});

api.delete('/atendimentoCancelado', async(req, res) =>{

  const{atendimentoID} = req.body;
    
  try{
     const connection = await mysql2.createConnection(dbConfig);

     const[resultado] = await connection.execute(`delete from atendimento where 
      atendimentoID = ?`, [atendimentoID]);
      await connection.end();

     if((!atendimentoID.affectedRows) === 0){

         res.status(404).json({message: "Sessão não encontrada!"});

     }

    res.status(200).json({message: "Sessão cancelada com sucesso!"});

  }catch(error){
          
      console.error("Falha ao processar requisição!", error.message);
      res.status(500).json({message: "Falha ao conectar com banco de dados!"});
   


  }

});


 api.post('/clientesNovos', async (req, res) =>{

      const {ClienteNome} = req.body;
    
        try{

            const connection = await mysql2.createConnection(dbConfig);

             await connection.execute(` Insert into cliente(ClienteNome)values(?)`,[ ClienteNome]);

              await connection.end();

             res.status(201).json("Chegou novos clientes!");
        }catch(error){
            console.error("requisição falha!", error.message);
            res.status(500).json("Erro ao conectar com o banco de dados!");
        }


   

 });

 api.get('/clientes', async(req, res) => {
        
       const connection = await mysql2.createConnection(dbConfig);
        
       try{
           const[rows] = await connection.execute(`select * from cliente;`);

           await connection.end();

          res.status(200).json(rows);
       }catch(error){

           console.error('Erro! Rota não encontrada!', error.message);
           res.status(500).json('Falha ao conectar com o banco de dados!');

       }


 });
 
 api.put('/clientesUpdate/:clienteID', async(req, res)=>{

         
         const {clienteID} = req.params;
         const {clienteNome} = req.body;
          try{
              const connection = await mysql2.createConnection(dbConfig);
              
             const[resultado] = await connection.execute(`update cliente set ClienteNome = ?
                where clienteID = ?`, [clienteNome, clienteID]);

                 await connection.end();

              if((!resultado.affectedRows) === 0){

                return res.status(404).json("Cliente inexistente!");
              }
            
            res.status(200).json("Atualização concluída!");

          }catch(error){

              console.log("Erro! rota não encontrada.", error.message);
              res.status(500).json({ message: "Erro ao conectar com o banco de dados!"});

          }





 });

 api.get('/funcionarios', async(req, res) =>{

       
        try{
            const connection = await mysql2.createConnection(dbConfig);

             const[rows] = await connection.execute(`select * from funcionario`);
           
              await connection.end(); 

            res.status(200).json(rows);

        }catch(error){
             console.error("Erro! Rota não encontrada", error.message);
             res.status(500).json({ message: "Erro ao conectar com o banco de dados"});
        } 
        
});

api.post('/funcionariosNovos', async(req, res) => {
       const{funcionarioNome, funcionarioCargo, funcionarioSalario} = req.body; 

         try{
             const connection = await mysql2.createConnection(dbConfig);
             
             const[rows] = await connection.execute(`insert into
                funcionario(funcionarioNome, funcionarioCargo,
                funcionarioSalario) values (?, ?, ?)`, [funcionarioNome, funcionarioCargo, funcionarioSalario]);
                 
                await connection.end();

              res.status(201).json({ message: "RH! Chegou funcionário novo!"});
              
         }catch(error){

            console.error("falha de requesição!", error.message);
            res.status(500).json({message: "Erro ao conectar com o banco!"});
                    
        }






});

api.delete('/FuncionariosDemitidos', async(req, res) => {

      const{funcionarioID} = req.body;
      try{
        const connection = await mysql2.createConnection(dbConfig);
         
        await connection.execute(`Delete from funcionario where funcionarioID = ?`, [funcionarioID]);
        await connection.end();
           
        res.status(200).json({ message: "Funcionário deletado com sucesso."});
   
      }catch(error){
         
        console.error("Falha ao processar requisição!", error.message);
        res.status(500).json({ message: "Falha ao acessar banco de dados!"});


      }




});

api.delete('/clientesExcluidos', async(req, res) => {
        const {clienteID} = req.body;
        
      try{
        const connection = await mysql2.createConnection(dbConfig);
          const[resultado] = await connection.execute(`Delete from cliente where
            clienteID = ?`, [clienteID]);
             
            await connection.end();

            if((!resultado.affectedRows) === 0)
            {
              res.status(404).json({message: "Cliente não encontrado!"});

            }
            res.status(200).json({message: "Cliente excluido com sucesso"});
      }catch(error){

           console.error("Erro ao processar requisição!", error.message);
           res.status(500).json({message: "Falha ao acessar o banco de dados!"})

      }

});

api.put('/funcionarioUpdate/:funcionarioID', async(req, res) => {

        const{funcionarioID} = req.params;
        const{funcionarioNome} = req.body;
        try{
            const connection = await mysql2.createConnection(dbConfig);
            
            const [resultado] = await connection.execute(`Update funcionario
              set funcionarioNome = ? where funcionarioID = ?`, [funcionarioNome, funcionarioID]);
                   
              await connection.end();

              if((!resultado.affectedRows)=== 0){

                res.status(404).json({message: "Funcionário não encontrado!"});
              }
              res.status(200).json({message: "Funcionario atualizado com sucesso!"});
        }catch(error){

            console.error("Falha ao processar requisição!", error.message);
            res.status(500).json({message: "Falha ao conectar com o banco dados!"})

        }




});

api.listen(port, ()=>{

    console.log(`Server rodando na porta http://localhost/${port}`);


});