const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find((user) => user.username === username)

  if(!user){
    return response.status(404).json({error: 'Mensagem do erro'})
  }

  request.user = user

  return next()

}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const existUser = users.find((user) => user.username === username)

  if(!existUser){
    const newUser = {
      id: uuidv4(),
      name,
      username,
      todos: []
    }
  
    users.push(newUser)
  
    return response.json(newUser).status(201)
  }else{
    return response.status(400).json({ error: 'Mensagem do erro'})
  }

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  const listTodoUser = user.todos

  return response.json(listTodoUser)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  const idTodo = request.params.id
  
  const todo = user.todos.find((todo) => todo.id === idTodo)

  if(todo){
    todo.title = title
    todo.deadline = new Date(deadline)
  
    return response.json(todo)
  }else{
    return response.status(404).json({error: 'Mensagem do erro'})
  }


});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const idTodo = request.params.id

  const todo = user.todos.find((todo) => todo.id === idTodo)

  if(todo){
    todo.done = true
  
    return response.json(todo)
  }else {
    return response.status(404).json({error: 'Mensagem do erro'})
  }

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const idTodo = request.params.id
  const todo = user.todos.find((todo) => todo.id === idTodo)

  if(todo){
    user.todos.splice(todo, 1)
    return response.status(204).json(user.todos)
  } else {
    return response.status(404).json({error: 'Mensagem do erro'})
  }

});

module.exports = app;