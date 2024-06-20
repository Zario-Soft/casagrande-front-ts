import { Fab, CardActionArea } from '@mui/material';
import { blue } from '@mui/material/colors';
import React, { useEffect, useState } from 'react';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ConfirmationDialog from '../dialogs/confirmation.dialog';

document.addEventListener("dragover", (event) => {
    event.preventDefault();
});

export interface ImageUploaderProps {
    id: string,
    onChange: (id: string, data: any) => void,
    onClickImage?: (id: string) => void,
    photo?: string,
    handleDrag: (props: ImageUploaderProps) => void,
    handleDrop: (props: ImageUploaderProps) => void,
}

export default function ImageUploader(props: ImageUploaderProps) {
    const [photo, setPhoto] = useState<string>();

    const inputId = `input-${props.id}`;

    const [dialogRemoveVisible, setDialogRemoveVisible] = useState(false);

    useEffect(() => {
        setPhoto(props.photo);
    }, [props.photo]);

    async function onChange(e: any) {
        var file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = async function (_: any) {
            await setPhoto(reader.result as string);

            if (props.onChange)
                await props.onChange(props.id, reader.result);
        };
    }

    async function onDrop(_: any) {
        props.handleDrop(props);
    }

    function onDragEnd(e: any) {
        e.preventDefault();
        e.stopPropagation();
        //setDragFrom(undefined);
    }

    async function onDragFrom(e: any) {
        e.stopPropagation();

        props.handleDrag(props);
    }

    async function onRemove() {
        await setDialogRemoveVisible(true);
    }

    async function ok() {
        if (props.onClickImage)
            props.onClickImage(props.id);

        await setDialogRemoveVisible(false);
        await setPhoto(undefined);
    }

    return <>
        {!photo && <>
            <input
                accept="image/*"
                style={{ display: 'none' }}
                id={inputId}
                type="file"
                onChange={onChange} />
            <label
                htmlFor={inputId}
                onDrop={onDrop}
            >
                <Fab component="span" sx={{
                    color: blue[900],
                    margin: 10
                }}>
                    <AddPhotoAlternateIcon />
                </Fab>
            </label>
        </>}

        {photo && <>
            <CardActionArea
                onClick={onRemove}
                onDragEnd={onDragEnd}
                onDragStart={onDragFrom}
            >
                <img width="100%" src={photo} alt={''} />
            </CardActionArea>
        </>}

        {dialogRemoveVisible && <ConfirmationDialog
            title={'Deseja realmente apagar a imagem atual?'}
            text={'Fique tranquilo, se você não clicar em "Salvar", a imagem não será substituida.'}
            onConfirm={ok}
            onClose={async () => await setDialogRemoveVisible(false)}
        />}
    </>
}