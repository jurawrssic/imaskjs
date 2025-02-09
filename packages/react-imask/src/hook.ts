import IMask from 'imask';
import { useEffect, useCallback, useState, useRef, Dispatch } from 'react';
import type { RefObject } from 'react';
import type { ReactMaskProps, ReactElement } from './mixin';


export default
function useIMask<
  Opts extends IMask.AnyMaskedOptions = IMask.AnyMaskedOptions,
  MaskElement extends ReactElement=HTMLInputElement,
>(
  opts: Opts,
  { onAccept, onComplete }: Pick<ReactMaskProps<Opts, true, IMask.InputMask<Opts>['value'], MaskElement>, 'onAccept' | 'onComplete'> = {}
): {
  ref: RefObject<MaskElement>,
  maskRef: RefObject<IMask.InputMask<Opts>>,
  value: IMask.InputMask<Opts>['value'],
  setValue: Dispatch<IMask.InputMask<Opts>['value']>,
  unmaskedValue: IMask.InputMask<Opts>['unmaskedValue'],
  setUnmaskedValue: Dispatch<IMask.InputMask<Opts>['unmaskedValue']>,
  typedValue: IMask.InputMask<Opts>['typedValue'],
  setTypedValue: Dispatch<IMask.InputMask<Opts>['typedValue']>,
} {
  const ref = useRef<MaskElement>(null);
  const maskRef = useRef<IMask.InputMask<Opts>>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [value, setValue] = useState<IMask.InputMask<Opts>['value']>('');
  const [unmaskedValue, setUnmaskedValue] = useState<IMask.InputMask<Opts>['unmaskedValue']>('');
  const [typedValue, setTypedValue] = useState<IMask.InputMask<Opts>['typedValue']>();

  const _destroyMask = useCallback(() => {
    maskRef.current?.destroy();
    maskRef.current = null;
  }, []);

  const _onAccept = useCallback(
    (event?: InputEvent) => {
      if (!maskRef.current) return;

      setTypedValue(maskRef.current.typedValue);
      setUnmaskedValue(maskRef.current.unmaskedValue);
      setValue(maskRef.current.value);
      onAccept?.(maskRef.current.value, maskRef.current, event);
    },
    [onAccept],
  );

  const _onComplete = useCallback(
    () => maskRef.current && onComplete?.(maskRef.current.value, maskRef.current),
    [onComplete],
  );

  useEffect(() => {
    const el = ref.current;

    if (!el || !opts?.mask) return _destroyMask();

    const mask = maskRef.current;

    if (!mask) {
      if (el && opts?.mask) {
        maskRef.current = IMask(el, opts);
        _onAccept();
      }
    } else {
      mask?.updateOptions(opts);
    }
    setInitialized(Boolean(mask));
  }, [opts, _destroyMask, _onAccept]);

  useEffect(() => {
    if (!maskRef.current) return;

    const mask = maskRef.current;

    mask.on('accept', _onAccept);
    mask.on('complete', _onComplete);

    return () => {
      mask.off('accept', _onAccept);
      mask.off('complete', _onComplete);
    };
  }, [_onAccept, _onComplete]);

  useEffect(() => {
    const mask = maskRef.current;
    if (mask && initialized) mask.value = value;
  }, [value]);

  useEffect(() => {
    const mask = maskRef.current;
    if (mask && initialized) mask.unmaskedValue = unmaskedValue;
  }, [unmaskedValue]);

  useEffect(() => {
    const mask = maskRef.current;
    if (mask && initialized) mask.typedValue = typedValue;
  }, [typedValue]);

  useEffect(() => _destroyMask, [_destroyMask]);

  return {
    ref,
    maskRef,
    value, setValue,
    unmaskedValue, setUnmaskedValue,
    typedValue, setTypedValue,
  };
}
