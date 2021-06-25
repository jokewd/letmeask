import { useState, FormEvent, useEffect } from 'react'
import { useParams } from 'react-router'
import { useHistory } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { database } from '../services/firebase'

import logoImg from '../assets/images/logo.svg'
import likeImg from '../assets/images/like.svg'
import { Button } from '../components/Button'
import { RoomCode } from '../components/RoomCode'
import { Question } from '../components/Question'

import '../styles/room.scss'
import '../styles/question.scss'
import { useRoom } from '../hooks/useRoom'


type RoomParams = {
	id: string
}


export function Room(){

	const { user, signInWithGoogle } = useAuth()
	const params = useParams<RoomParams>()
	const history = useHistory();
	const [newQuestion, setNewQuestion] = useState('')	
	const roomId = params.id
	const { questions, title } = useRoom(roomId)

	
	async function handleLogin(){
		if(!user){
			await signInWithGoogle()
		}

		history.push(`rooms/${roomId}`)
	}

	async function handleSendQuestion(event: FormEvent){
		event.preventDefault()

		if(newQuestion.trim() === ''){
			return
		}

		if(!user){
			throw new Error('Você precisa estar logado.')
		}

		const question = {
			content: newQuestion,
			author: {
				name: user.name,
				avatar: user.avatar
			},
			isHighlighted: false,
			isAnswered: false
		}

		await database.ref(`rooms/${roomId}/questions`).push(question)

		setNewQuestion('')
	}

	async function handleLikeQuestion(questionId: string, likeId: string | undefined){
		if(likeId){
			await database.ref(`rooms/${roomId}/questions/${questionId}/likes/${likeId}`).remove()

		}else{
			await database.ref(`rooms/${roomId}/questions/${questionId}/likes`).push({
				authorId: user?.id
			})
		}
	}


	return(
		<div id="page-room">
			<header>
				<div className="content">
					<img src={logoImg} alt="letmeask" />
					<RoomCode code={roomId} />
				</div>
			</header>

			<main className="content">
				<div className="room-title">
					<h1>{title}</h1>
					{ questions.length > 0 && <span>{questions.length} pergunta(s)</span> }
				</div>

				<form onSubmit={handleSendQuestion}>
					<textarea placeholder="O que você quer perguntar?" value={newQuestion} onChange={event => setNewQuestion(event.target.value)} />

					<div className="form-footer">
						{
							user ? (
								<div className="user-info">
									<img src={user.avatar} alt={user.name} />
									<span>{user.name}</span>
								</div>
								
							) : (
								<span>Para enviar uma pergunta, <button onClick={handleLogin}>faça seu login</button>.</span>
							)
						}
						<Button type="submit" disabled={!user}>Enviar pergunta</Button>
					</div>
				</form>

				<div className="question-list">
					{questions.map(question => {
						return (
							<Question 
								key={question.id}
								content={question.content}
								author={question.author} 
								isAnswered={question.isAnswered}
								isHighlighted={question.isHighlighted}
							>
								{!question.isAnswered && (
									<button 
										className={`like-button ${question.likeId ? 'liked' : ''}`} 
										type="button" 
										aria-label="Marcar como gostei" 
										onClick={() => handleLikeQuestion(question.id, question.likeId)}
									>
										<img src={likeImg} alt="" />
										{question.likeCount > 0 && <span>{question.likeCount}</span>}
									</button>
								)}
							</Question>
						)
					})}
				</div>
			</main>
		</div>
	)

}