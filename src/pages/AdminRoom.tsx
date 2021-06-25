import { useState, FormEvent, useEffect } from 'react'
import { useParams } from 'react-router'
import { useHistory } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { database } from '../services/firebase'

import logoImg from '../assets/images/logo.svg'
import deleteImg from '../assets/images/delete.svg'
import checkImg from '../assets/images/check.svg'
import answerImg from '../assets/images/answer.svg'
import { Button } from '../components/Button'
import { RoomCode } from '../components/RoomCode'
import { Question } from '../components/Question'

import '../styles/room.scss'
import '../styles/question.scss'
import { useRoom } from '../hooks/useRoom'


type RoomParams = {
	id: string
}


export function AdminRoom(){

	const { user, signInWithGoogle } = useAuth()
	const params = useParams<RoomParams>()
	const history = useHistory();
	const roomId = params.id
	const { questions, title } = useRoom(roomId)

	
	async function handleLogin(){
		if(!user){
			await signInWithGoogle()
		}

		history.push(`rooms/${roomId}`)
	}


	async function handleDeleteQuestion(questionId: string){
		if(window.confirm('Tem certeza que deseja excluir essa pergunta?')){
			const questionRef = await database.ref(`rooms/${roomId}/questions/${questionId}`).remove()
		}
	}

	async function handleEndRoom(){
		database.ref(`rooms/${roomId}`).update({
			endedAt: new Date()
		})

		history.push('/')
	}

	async function handleCheckQuestionAsAnswered(questionId: string){
		await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
			isAnswered: true
		})
	}

	async function handleHighlightQuestion(questionId: string){
		await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
			isHighlighted: true
		})
	}


	return(
		<div id="page-room">
			<header>
				<div className="content">
					<img src={logoImg} alt="letmeask" />
					<div className="options">
						<RoomCode code={roomId} />
						<Button isOutlined onClick={handleEndRoom}>Encerrar sala</Button>
					</div>
				</div>
			</header>

			<main className="content">
				<div className="room-title">
					<h1>{title}</h1>
					{ questions.length > 0 && <span>{questions.length} pergunta(s)</span> }
				</div>

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
									<>
										<button
											type="button"
											onClick={() => handleCheckQuestionAsAnswered(question.id)}
										>
											<img src={checkImg} alt="Pergunta respondida" />
										</button>
										<button
											type="button"
											onClick={() => handleHighlightQuestion(question.id)}
										>
											<img src={answerImg} alt="Destacar pergunta" />
										</button>
									</>
								)}
								<button
									type="button"
									onClick={() => handleDeleteQuestion(question.id)}
								>
									<img src={deleteImg} alt="Remover pergunta" />
								</button>
							</Question>
						)
					})}
				</div>
			</main>
		</div>
	)

}