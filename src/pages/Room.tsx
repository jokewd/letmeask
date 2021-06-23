import { useState, FormEvent, useEffect } from 'react'
import { useParams } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { database } from '../services/firebase'

import logoImg from '../assets/images/logo.svg'
import { Button } from '../components/Button'
import { RoomCode } from '../components/RoomCode'

import '../styles/room.scss'


type RoomParams = {
	id: string
}

type FirebaseQuestions = Record<string, {
	author: {
		name: string,
		avatar: string
	},
	content: string,
	isAnswered: boolean,
	isHighlighted: boolean
}>

type Question = {
	id: string,
	author: {
		name: string,
		avatar: string
	},
	content: string,
	isAnswered: boolean,
	isHighlighted: boolean
}

export function Room(){

	const { user } = useAuth()
	const params = useParams<RoomParams>()
	const [newQuestion, setNewQuestion] = useState('')
	const [questions, setQuestions] = useState<Question[]>([])
	const [title, setTitle] = useState('')
	const roomId = params.id


	useEffect(() => {
		const roomRef = database.ref(`rooms/${roomId}`)

		roomRef.on('value', room => {
			const databaseRoom = room.val()
			const firebaseQuestions : FirebaseQuestions = databaseRoom.questions ?? {}

			const parsedQuestions = Object.entries(firebaseQuestions ?? {}).map(([key, value]) => {
				return {
					id: key,
					content: value.content,
					author: value.author,
					isHighlighted: value.isHighlighted,
					isAnswered: value.isAnswered
				}
			})

			setQuestions(parsedQuestions)
			setTitle(databaseRoom.title)
		})
	}, [roomId])


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
					<textarea placeholder="O que você quer pergntar?" value={newQuestion} onChange={event => setNewQuestion(event.target.value)} />

					<div className="form-footer">
						{
							user ? (
								<div className="user-info">
									<img src={user.avatar} alt={user.name} />
									<span>{user.name}</span>
								</div>
								
							) : (
								<span>Para enviar uma pergunta, <button>faça seu login</button>.</span>
							)
						}
						<Button type="submit" disabled={!user}>Enviar pergunta</Button>
					</div>
				</form>

				{JSON.stringify(questions)}
			</main>
		</div>
	)

}