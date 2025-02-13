import { $, component$, useStore } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';

import { Gradient } from '~/components/util/HexUtils';
import { convertToHex, convertToRGB, generateOutput, getRandomColor } from '~/components/util/RGBUtils';

import { ChevronDown, ChevronUp, ColorFillOutline, SettingsOutline, Text } from 'qwik-ionicons';

import { Button, ColorInput, Header, NumberInput, TextArea, TextInput, Toggle } from '@luminescent/ui';
import { getCookies } from '~/components/util/SharedUtils';

const presets = {
  'stun': ['#FFFFFF', '#32CD32'],
};

export const setCookie = $(function (store: any) {
  const json = JSON.parse(store);
  delete json.alerts;
  const cookie: { [key: string]: string; } = {};
  document.cookie.split(/\s*;\s*/).forEach(function (pair) {
    const pairsplit = pair.split(/\s*=\s*/);
    cookie[pairsplit[0]] = pairsplit.splice(1).join('=');
  });
  Object.keys(json).forEach(key => {
    const existingCookie = cookie[key];
    if (existingCookie === json[key]) return;
    document.cookie = `${key}=${encodeURIComponent(json[key])}; path=/`;
  });
});

const replacements = {
  a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ғ', g: 'ɢ',
  h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ',
  o: 'ᴏ', p: 'ᴘ', q: 'q', r: 'ʀ', s: 's', t: 'ᴛ', u: 'ᴜ',
  v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ', р: 'ᴘ', а: 'ᴀ',
  к: 'ᴋ', е: 'ᴇ',
};

const defaults = {
  colors: presets.stun,
  text: 'stun',
  format: '&x&$1&$2&$3&$4&$5&$6$f$c',
  formatchar: '&',
  customFormat: false,
  prefix: '',
  bold: true,
  italic: false,
  underline: false,
  strikethrough: false,
};

export const useCookies = routeLoader$(async ({ cookie, url }) => {
  return await getCookies(cookie, Object.keys(defaults), url.searchParams) as typeof defaults;
});

export default component$(() => {
  const cookies = useCookies().value;
  const store = useStore({
    ...defaults,
    ...cookies,
    alerts: [] as {
      class: string,
      translate: string,
      text: string,
    }[],
  }, { deep: true });

  const output = store.text.toLowerCase().replace(/[a-z]/g, function(match) {
    return replacements[match as keyof typeof replacements];
  });

  const handleSwap = $(
    function handleSwap(currentIndex: number, newIndex: number) {
      const colorsLength = store.colors.length;
      if (newIndex < 0) {
        newIndex = colorsLength - 1;
      } else if (newIndex >= colorsLength) {
        newIndex = 0;
      }

      const temp = store.colors[currentIndex];
      store.colors[currentIndex] = store.colors[newIndex];
      store.colors[newIndex] = temp;
      setCookie(JSON.stringify(store));
    },
  );

  return (
    <section class="flex mx-auto max-w-7xl px-6 items-center justify-center min-h-[calc(100svh)] pt-[72px]">
      <div class="my-10 min-h-[60px] w-full">

        {/* charlimit={256} */}
        <TextArea output id="Output" value={generateOutput(output, store.colors, defaults.format, defaults.formatchar, defaults.prefix, defaults.bold)}>
          <Header>
            Вывод
          </Header>
        </TextArea>

        <h1 class={{
          'text-4xl sm:text-6xl my-6 break-all max-w-7xl -space-x-[1px] font-mc': true,
          'font-mc-bold': store.bold,
          'font-mc-italic': store.italic,
          'font-mc-bold-italic': store.bold && store.italic,
        }}>
          {(() => {
            const text = store.text ? store.text : 'stun';

            let colors = store.colors.map((color: string) => convertToRGB(color));
            if (colors.length < 2) colors = [convertToRGB('#00FFE0'), convertToRGB('#EB00FF')];
            const gradient = new Gradient(colors, text.replace(/ /g, '').length);

            let hex = '';
            return text.split('').map((char: string, i: number) => {
              if (char != ' ') hex = convertToHex(gradient.next());
              return (
                <span key={`char${i}`} style={`color: #${hex};`} class={{
                  'underline': store.underline,
                  'strikethrough': store.strikethrough,
                  'underline-strikethrough': store.underline && store.strikethrough,
                }}>
                  {char}
                </span>
              );
            });
          })()}
        </h1>

        <div id="mobile-navbuttons" class="my-4 sm:hidden">
          <div class="flex gap-2">
            <Button aria-label="Colors" onClick$={() => {
              document.getElementById('colors')!.classList.remove('hidden');
              document.getElementById('inputs')!.classList.replace('flex', 'hidden');
              document.getElementById('formatting')!.classList.add('hidden');
            }}>
              <ColorFillOutline width="24" />
            </Button>
            <Button aria-label="Inputs" onClick$={() => {
              document.getElementById('colors')!.classList.add('hidden');
              document.getElementById('inputs')!.classList.replace('hidden', 'flex');
              document.getElementById('formatting')!.classList.add('hidden');
            }}>
              <SettingsOutline width="24" />
            </Button>
            <Button aria-label="Formatting" onClick$={() => {
              document.getElementById('colors')!.classList.add('hidden');
              document.getElementById('inputs')!.classList.replace('flex', 'hidden');
              document.getElementById('formatting')!.classList.remove('hidden');
            }}>
              <Text width="24" class="fill-white" />
            </Button>
          </div>
        </div>

        <div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div class="hidden sm:flex flex-col gap-3 relative" id="colors">
            <NumberInput input min={2} max={store.text.length} value={store.colors.length} id="colorsinput" class={{ 'w-full': true }}
              onChange$={(event: any) => {
                if (event.target!.value < 2) return;
                if (event.target!.value > store.text.length) return event.target!.value = store.text.length;
                const newColors = [];
                for (let i = 0; i < event.target!.value; i++) {
                  if (store.colors[i]) newColors.push(store.colors[i]);
                  else newColors.push(getRandomColor());
                }
                store.colors = newColors;
                setCookie(JSON.stringify(store));
              }}
              onIncrement$={() => {
                store.colors.push(getRandomColor());
                setCookie(JSON.stringify(store));
              }}
              onDecrement$={() => {
                store.colors.pop();
                setCookie(JSON.stringify(store));
              }}
            >
              Количество цветов
            </NumberInput>
            <div class="flex flex-col gap-2 overflow-auto sm:max-h-[500px]">
              {store.colors.map((color: string, i: number) => {
                return <div key={`color${i + 1}`} class="flex items-end">
                  <ColorInput
                    id={`color${i + 1}`}
                    value={color}
                    onInput$={(newColor: string) => {
                      store.colors[i] = newColor;
                      setCookie(JSON.stringify(store));
                    }}
                    class={{ 'w-full': true }}
                    presetColors={store.colors}
                  >
                    HEX-цвет {i + 1}
                  </ColorInput>
                  <div class="bg-gray-800 flex ml-2 rounded-md border border-gray-700">
                    <button onClick$={() => handleSwap(i, i - 1)} class="hover:bg-gray-700 px-2 py-3 rounded-l-md transition-all">
                      <ChevronUp width="20" />
                    </button>
                    <div class="bg-gray-700 w-px" />
                    <button onClick$={() => handleSwap(i, i + 1)} class="hover:bg-gray-700 px-2 py-3 rounded-r-md transition-all">
                      <ChevronDown width="20" />
                    </button>
                  </div>
                </div>;
              })}
            </div>
          </div>
          <div class="md:col-span-2 lg:col-span-3">
            <div class="flex flex-col gap-3" id="inputs">
              <TextInput id="input" value={store.text} placeholder="stun" onInput$={(event: any) => { store.text = event.target!.value; setCookie(JSON.stringify(store)); }}>
                Текст
              </TextInput>
            </div>
            <div class="sm:mt-6 mb-4 space-y-4 hidden sm:block" id="formatting">
              <Toggle id="bold" checked={defaults.bold}
                label='Жирный шрифт'
                disabled />
              <Toggle id="smallcaps" checked={defaults.bold}
                disabled
                label="Маленький шрифт" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Gradients',
  meta: [
  ],
};
