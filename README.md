# virtualscape - a love letter

## introduction
this is the first time i create a website entirely from scratch, and i wanted to make it special, at least for me. 

by designing and developing it, i'm trying to cultivate a small corner of the internet as a space that is as intimate as public, a sort of diary distant from the dynamics of power and control that rule social media channels that instead could bring me closer to what was the ingenuity, verginity and playfulness of the early web. 

it is my romantic love letter to the utopia of the internet as a powerful platform for distributing open knowledge, to browser art and internet culture as a whole. to technology as something to get closer to us and not to alienate: not as a tool of force but as a way of care. this place is not different from the plants that keep me company in my room.
this is precisely why this code is open-source - _i mean, don't expect too much from it..._ - but in case you are interested in using or modifying it, next you can find a few guidelines.

## inspiration 
my main inspiration come from Grunge and Brutalist Web Design, and in particular videogames menus’ UI/UX. my idea was to recreate the feeling of the title screen of a videogame, before the story starts, and enabling an interaction that could also work by mainly using your keyboard or even a joystick.
this is side of the project is still work in progress but i would love to further gamify the interaction.

## technical stuff 
- the site is designed to be modular, so it should be pretty flexible to adapt in case you want to add/modify/remove any content or change the overall aesthetics.
- this is a SPA (Single Page Application) structure, which allows to navigate between the different pages in a fluid manner without interruptions or loading. as you may have noticed, there is only one HTML that collects all the data, and not a single one for each content.
- this code has a logical management of elements thorugh javascript associated to the respective categories, which update automatically.
- there is archive system that allows to display different types of visualization associated to the respective type of file attached, and based on navigation through hyperlinks.
- the "compost" page is a arbitrary visualization of files based on a js archive that classifies those files in "quotes", "text", "images" and "audio". each time files are displayed with different horizontal placement, scale and typography. for audio files, it also includes an internal player that automatically analyses the waveform through _wavesurfer.js_. you can re-use the structure and modify it as you wish, adding/removing file formats, increasing the random parameters, distributing them vertically etc...
- a collection of funky fonts all protected by different open-source licenses, all referenced under css/custom-fonts.css.
_for any questions feel free to contact me by [email](nicolo.baldi010@gmail.com)._

## conclusions
special thanks goes to my dear code nerds [matilde sartori](https://matildee3.github.io/matilde/) and [minnie pangilinan](https://zines.minniemakes.co/), who have patiently helped and followed me in the programming process, trying to debug whatever the hell i was trying to achieve. this virtual space is here thanks to them.

even though i don't like to admit it, i would be hypocritical by not mentioning that i was also helped by AI in the development of this, and as much as i am not too proud of it, i have to say that as of today, _machines are strong in performing machine tasks_.

having said that, i would like to emphasise that this page will constantly be work in progress, just like my organic and physical self, so _don't rely too much on it (or on me)_. 

i will try to document as much as possible these changes, which will not always aim for greater efficiency, but instead will just be a digital window on my journey here, on earth.

_may this code reverberate beyond me over a continuous electrical flux_

nicolò baldi
may 2025