"use client";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

interface Props {
    value: string;
    onChange: (value: string) => void;
    onCityChange?: (city: string) => void;
    onPostalCodeChange?: (postalCode: string) => void;
    onStreetAddressChange?: (streetAddress: string) => void;
    id?: string;
}

export default function AddressAutocomplete({ value, onChange, onCityChange, onPostalCodeChange, onStreetAddressChange, id }: Props) {
    const t = useTranslations('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Attendre que window.google soit disponible
        const checkGoogleLoaded = setInterval(() => {
            // @ts-ignore
            if (window.google) {
                clearInterval(checkGoogleLoaded);
                initAutocomplete();
            }
        }, 100);

        function initAutocomplete() {
            // @ts-ignore
            if (!inputRef.current || !window.google) return;

            // @ts-ignore
            const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
                types: ['address'],
                componentRestrictions: { country: 'ca' },
            });

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();

                if (place.formatted_address) {
                    onChange(place.formatted_address);
                }

                const streetNumber = place.address_components?.find((c: any) => c.types.includes('street_number'))?.long_name ?? '';
                const route = place.address_components?.find((c: any) => c.types.includes('route'))?.long_name ?? '';
                const streetAddress = `${streetNumber} ${route}`.trim();
                if (streetAddress) {
                    onStreetAddressChange?.(streetAddress);
                }

                const cityComponent = place.address_components?.find((c: any) => c.types.includes('locality'));
                if (cityComponent) {
                    onCityChange?.(cityComponent.long_name);
                }

                const postalComponent = place.address_components?.find((c: any) => c.types.includes('postal_code'));
                if (postalComponent) {
                    onPostalCodeChange?.(postalComponent.long_name);
                }
            });
        }

        return () => clearInterval(checkGoogleLoaded);
    }, [onChange, onCityChange, onPostalCodeChange, onStreetAddressChange]);

    return (
        <>
            <input type="text" name="address" style={{ display: 'none' }} autoComplete="address-line1" />
            <input type="text" name="city" style={{ display: 'none' }} autoComplete="address-level2" />

            <input
                ref={inputRef}
                id={id}
                type="text"
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={t("addressAutoComplete")}
                autoComplete="off"
            />
        </>
    );
}