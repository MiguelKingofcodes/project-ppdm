// index.js
// Importa a biblioteca Express para criar um servidor e definir rotas HTTP
const express = require('express');
// Importa a biblioteca MySQL2 para manipular o banco de dados MySQL, usando promises para lidar com operações assíncronas
const mysql = require('mysql2/promise');
// Importa a biblioteca bcrypt para criptografar senhas de forma segura
const bcrypt = require('bcrypt');
// Importa a biblioteca Multer para manipulação de upload de arquivos, como imagens
const multer = require('multer');

// Importa variáveis de ambiente do arquivo .env
require('dotenv').config();

// Inicializa o aplicativo Express
const app = express();
// Configura o middleware para interpretar JSON no corpo das requisições
app.use(express.json());

// Cria um pool de conexões para o banco de dados com configurações do .env
const pool = mysql.createPool({
  host: process.env.DB_HOST,           // Endereço do banco de dados
  user: process.env.DB_USER,           // Nome de usuário para conexão
  password: process.env.DB_PASSWORD,   // Senha de acesso ao banco
  database: process.env.DB_NAME        // Nome do banco de dados a ser utilizado
});

// Verifica a conexão com o banco de dados e registra uma mensagem de sucesso ou erro
pool.getConnection()
  .then(() => console.log('Conectado ao banco de dados MySQL'))
  .catch((err) => {
    console.error('Erro ao conectar ao banco de dados:', err); // Log de erro
    process.exit(1); // Encerra o processo em caso de erro
  });	

// Define o número de saltos para bcrypt, usado na criptografia de senhas
const SALT_ROUNDS = 10;

// Rota de registro de usuário
app.post('/register', async (req, res) => {
  try {
    const { name, email, password, question, answer } = req.body; // Desestrutura os dados da requisição

    // Verifica se o email já está registrado no banco de dados
    const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email já está em uso. Escolha outro.' });
    }

    // Criptografa a senha fornecida pelo usuário
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Criptografa a resposta da pergunta de segurança do usuário
    const hashedSecurityAnswer = await bcrypt.hash(answer, SALT_ROUNDS);

    // Armazena pergunta e resposta de segurança em formato JSON
    const securityQuestionsAnswers = JSON.stringify({
      question: question,
      answer: hashedSecurityAnswer
    });

    // Insere o novo usuário no banco de dados com os dados criptografados
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, security_questions_answers) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, securityQuestionsAnswers]
    );

    // Retorna o ID do novo usuário como resposta
    res.status(201).json({ message: 'Usuário registrado com sucesso', userId: result.insertId });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error); // Log do erro
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

// Rota de login de usuário
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) { // Verifica se o usuário existe
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = rows[0]; // Seleciona o usuário encontrado

    // Verifica a senha usando bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Retorna os dados do usuário com campos necessários, incluindo imagem de perfil
    res.json({ 
      user: { 
        userId: user.id, // Mapeia 'id' para 'userId'
        name: user.name,
        email: user.email,
        photo: user.profile_image ? `data:image/jpeg;base64,${user.profile_image.toString('base64')}` : null
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error); // Log do erro
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Rota para verificar se o email existe e retornar a pergunta de segurança
app.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) { // Verifica se o email existe
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Responde com sucesso se o email for encontrado
    res.status(200).json({ message: 'Email verificado com sucesso' });
  } catch (error) {
    console.error('Erro ao buscar email:', error); // Log do erro
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Rota para verificar se a resposta de segurança está correta
app.post('/check-security-question-answer', async (req, res) => {
  try {
    const { email, securityQuestion, securityAnswer } = req.body;

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) { // Verifica se o usuário existe
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = rows[0];
    const securityInfo = user.security_questions_answers; // Acessa as perguntas e respostas de segurança

    // Verifica se a pergunta está correta
    if (securityInfo.question !== securityQuestion) {
      return res.status(401).json({ error: 'Pergunta ou resposta de segurança incorreta!' });
    }

    // Verifica a resposta usando bcrypt
    const isAnswerValid = await bcrypt.compare(securityAnswer, securityInfo.answer);
    if (!isAnswerValid) {
      return res.status(401).json({ error: 'Pergunta ou resposta de segurança incorreta!' });
    }

    res.status(200).json({ message: 'Pergunta e resposta corretas, pode redefinir a senha' });
  } catch (error) {
    console.error('Erro ao verificar pergunta e resposta de segurança:', error); // Log do erro
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Rota para redefinir a senha do usuário
app.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Criptografa a nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashedNewPassword, email]);

    res.status(200).json({ success: true, message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error); // Log do erro
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Configuração do Multer para armazenar a imagem em memória antes de salvar no banco de dados
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Rota para upload de imagem de perfil
app.post('/upload', upload.single('profile_image'), async (req, res) => {
  try {
    const userId = req.body.userId;
    const imageBuffer = req.file.buffer;

    if (!userId || !imageBuffer) {
      return res.status(400).json({ error: 'userId e profile_image são obrigatórios' });
    }

    await pool.query(
      'UPDATE users SET profile_image = ? WHERE id = ?',
      [imageBuffer, userId]
    );

    res.status(200).json({ message: 'Imagem de perfil atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error); // Log do erro
    res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
  }
});

// Rota para recuperar a imagem de perfil do usuário
app.get('/image/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const [rows] = await pool.query('SELECT profile_image FROM users WHERE id = ?', [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const image = rows[0].profile_image;

    if (!image) {
      return res.status(404).json({ error: 'Imagem não encontrada' });
    }

    // Define o tipo de conteúdo para a imagem (ajustar se necessário)
    res.set('Content-Type', 'image/jpeg'); // Supondo que a imagem seja JPEG
    res.send(image); // Envia a imagem para o cliente
  } catch (error) {
    console.error('Erro ao obter imagem de perfil:', error); // Log do erro
    res.status(500).json({ error: 'Erro ao obter imagem de perfil' });
  }
});

// ======================== IMPLEMENTAÇÃO ATIVIDADE ==============================


// Obter produtos
app.get('/products', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });

  // Cadastrar produto
  app.post('/products', (req, res) => {
    const { name_product, price_product } = req.body;
    const query = `INSERT INTO products (name_product, price_product) VALUES (?, ?)`;
    db.run(query, [name_product, price_product], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id_product: this.lastID });
    });
  });



// Inicia o servidor na porta especificada no arquivo .env
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));



