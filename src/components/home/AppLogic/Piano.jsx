// export default function Piano() {
//     return (
//         <div className="w-full h-full">
//             <iframe
//                 src="https://4four.io/embed/piano"
//                 className="w-full h-full"
//                 frameborder="0">
//                 <a href="https://4four.io/piano">
//                     Piano
//                 </a>
//             </iframe>
//         </div>
//     )
// }

import React from 'react';
import {
    Piano as PianoKeyboard,
    KeyboardShortcuts,
    MidiNumbers
} from 'react-piano';

import * as Tone from 'tone';
import 'react-piano/dist/styles.css';

const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
        type: 'triangle',
    },
    envelope: {
        attack: 0.005,
        decay: 0.3,
        sustain: 0.2,
        release: 1.2,
    },
}).toDestination();

const Piano = () => {
    const firstNote = MidiNumbers.fromNote('c4');
    const lastNote = MidiNumbers.fromNote('c5');

    const keyboardShortcuts = KeyboardShortcuts.create({
        firstNote: firstNote,
        lastNote: lastNote,
        keyboardConfig: KeyboardShortcuts.HOME_ROW,
    });

    return (
        <div className="w-full h-full flex justify-center items-center">
            <div className="w-full max-w-150">
                <PianoKeyboard
                    noteRange={{
                        first: firstNote,
                        last: lastNote,
                    }}
                    playNote={async (midiNumber) => {
                        await Tone.start();

                        synth.triggerAttack(
                            Tone.Frequency(
                                midiNumber,
                                'midi'
                            ).toFrequency()
                        );
                    }}
                    stopNote={(midiNumber) => {
                        synth.triggerRelease(
                            Tone.Frequency(
                                midiNumber,
                                'midi'
                            ).toFrequency()
                        );
                    }}
                    width={600}
                    keyboardShortcuts={keyboardShortcuts}
                />
            </div>
        </div>
    );
};

export default Piano;