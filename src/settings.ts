import express, {Request, Response} from 'express';

export const app = express()

app.use(express.json())

type RequestWithParams<P> = Request<P, {}, {}, {}>
type RequestWithBody<B> = Request<{}, {}, B, {}>
type RequestWithParamsAndBody<P,B> = Request<P, {}, B, {}>

type ErrorsMessages = {
    message: string
    field: string
}

type ErrorType = {
    errorsMessages: ErrorsMessages[]
}

enum AvailableResolution {
    P144 = 'P144',
    P240 = 'P240',
    P360 = 'P360',
    P480 = 'P480',
    P720 = 'P720',
    P1080 = 'P1080',
    P1440 = 'P1440',
    P2160 = 'P2160'
}

type VideoType = {
    id: number
    title: string
    author: string
    canBeDownloaded: boolean
    minAgeRestriction: number | null
    createdAt: string
    publicationDate: string
    availableResolutions: AvailableResolution[]
}

const videoDb: VideoType[] = [
    {
        id: 0,
        title: "string",
        author: "string",
        canBeDownloaded: true,
        minAgeRestriction: null,
        createdAt: "2023-10-19T12:50:41.242Z",
        publicationDate: "2023-10-19T12:50:41.242Z",
        availableResolutions: [
            AvailableResolution.P144
        ]
    }
]

app.get('/videos', (req: Request, res: Response) => {
    res.status(200).send(videoDb)
})

app.get('/videos/:id', (req: RequestWithParams<{ id: number }>, res: Response) => {
    const id = +req.params.id

    const video = videoDb.find((video) => video.id === id)

    if (!video) {
        res.sendStatus(404)
        return
    }

    res.status(200).send(video)
})

app.post('/videos', (req: RequestWithBody<{
    title: string,
    author: string,
    availableResolutions: AvailableResolution[]
}>, res: Response) => {

    let errors: ErrorType = {
        errorsMessages: []
    }

    let {title, author, availableResolutions} = req.body

    if (!title || !title.length || title.trim().length > 40) {
        errors.errorsMessages.push({message: 'Invalid title', field: 'title'})
    }

    if (!author || !author.length || author.trim().length > 20) {
        errors.errorsMessages.push({message: 'Invalid author', field: 'author'})
    }

    if (Array.isArray(availableResolutions) && availableResolutions.length) {
        availableResolutions.map((r) => {
            !AvailableResolution[r] && errors.errorsMessages.push({message: 'Invalid availableResolutions', field: 'availableResolutions'})
        })
    } else {
        availableResolutions = []
    }

    if (errors.errorsMessages.length) {
        res.status(400).send(errors)
        return
    }

    const createdAt = new Date()
    const publicationDate = new Date()

    publicationDate.setDate(createdAt.getDate() + 1)

    const newVideo: VideoType = {
        id: +(new Date()),
        title: title,
        author: author,
        canBeDownloaded: false,
        minAgeRestriction: null,
        createdAt: createdAt.toISOString(),
        publicationDate: publicationDate.toISOString(),
        availableResolutions: availableResolutions
    }

    videoDb.push(newVideo)

    res.status(201).send(newVideo)
})

app.delete ('/testing/all-data', (req: Request, res: Response) => {
    videoDb.length = 0
    res.sendStatus(204)
})

app.delete ('/videos/:id', (req: RequestWithParams<{id: number}>, res: Response) => {
    const id = +req.params.id

    const video = videoDb.find((video) => video.id === id)

    if (!video) {
        res.sendStatus(404)
        return
    }

    videoDb.splice(videoDb.indexOf(video),1)
    res.sendStatus(204)
})

app.put('/videos/:id', (req: RequestWithParamsAndBody<
    {id: number},
    {title: string,
    author: string,
    availableResolutions: AvailableResolution[],
    canBeDownloaded: boolean,
    minAgeRestriction: number | null,
    publicationDate: string
}>, res: Response) => {
    const id = +req.params.id

    const video = videoDb.find((video) => video.id === id)

    if (!video) {
        res.sendStatus(404)
        return
    }

    let errors: ErrorType = {
        errorsMessages: []
    }

    let {title, author, availableResolutions, canBeDownloaded, minAgeRestriction, publicationDate} = req.body

    if (!title || !title.length || title.trim().length > 40) {
        errors.errorsMessages.push({message: 'Invalid title', field: 'title'})
    }

    if (!author || !author.length || author.trim().length > 20) {
        errors.errorsMessages.push({message: 'Invalid author', field: 'author'})
    }

    if (Array.isArray(availableResolutions) && availableResolutions.length) {
        availableResolutions.map((r) => {
            !AvailableResolution[r] && errors.errorsMessages.push({message: 'Invalid availableResolutions', field: 'availableResolutions'})
        })
    } else {
        availableResolutions = []
      }

    if (typeof canBeDownloaded !== 'boolean') {
        errors.errorsMessages.push({message: 'Invalid canBeDownloaded', field: 'canBeDownloaded'})
    }

    if (minAgeRestriction < 0 || minAgeRestriction > 18) {
        errors.errorsMessages.push({message: 'Invalid minAgeRestriction', field: 'minAgeRestriction'})
    }

    if (typeof publicationDate !== 'string') {
        errors.errorsMessages.push({message: 'Invalid publicationDate', field: 'publicationDate'})
    }

    if (errors.errorsMessages.length) {
        res.status(400).send(errors)
        return
    }

    let i = videoDb.findIndex((video) => video.id === id)
    videoDb[i].title = title
    videoDb[i].author = author
    videoDb[i].availableResolutions = availableResolutions
    if (canBeDownloaded === null) {
        videoDb[i].canBeDownloaded = false
    } else {
        videoDb[i].canBeDownloaded = canBeDownloaded
      }
    if (minAgeRestriction !== null) {
        videoDb[i].minAgeRestriction = minAgeRestriction
    }
    if (publicationDate.length) {
        videoDb[i].publicationDate = publicationDate
    }
    res.sendStatus(204)
})