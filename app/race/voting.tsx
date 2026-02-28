import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Image, TextInput, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { DRIVERS } from '../../constants/drivers';
import { useVoting } from '../../context/VotingContext';
import { F1_CALENDAR } from '@/constants/f1Calendar';
import ViewShot from "react-native-view-shot";
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

export default function VotingScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { userVotes, saveVotes } = useVoting();
    const insets = useSafeAreaInsets();
    const viewShotRef = useRef<any>(null);
    const nextRace = F1_CALENDAR.find(race => new Date(race.limit) > new Date()) || F1_CALENDAR[F1_CALENDAR.length - 1];
    const isSprintWeekend = nextRace.isSprint;
    
    const [step, setStep] = useState(0);

    const [votes, setVotes] = useState(() => {
        const baseVotes = {
            safetyCar: null,
            redFlags: 0,
            dnfs: 0,
            fastestLap: null,
            top10: Array(10).fill(null),
            top8Sprint: Array(8).fill(null),
            sprintPole: null,
            francoPitStop: "",
            francoDNF: null,
            francoDNFSessions: [], // Cambiado a Array para múltiple selección
            francoPoints: null,
        };
        return userVotes ? { ...baseVotes, ...userVotes } : baseVotes;
    });

    const francoSessions = isSprintWeekend 
        ? ["P1", "QUALI SPRINT", "SPRINT", "QUALI", "CARRERA"]
        : ["P1", "P2", "P3", "QUALI", "CARRERA"];

    const hitSlop = { top: 20, bottom: 20, left: 20, right: 20 };

    const handleFinish = () => {
        saveVotes(votes);
        router.replace('/race');
    };

    const handleNextStep = () => {
        if (step === 0) setStep(1);
        else if (step === 1) isSprintWeekend ? setStep(1.5) : setStep(2);
        else if (step === 1.5) setStep(2);
        else if (step === 2) setStep(3);
        else if (step === 3) setStep(4);
    };

    const captureAndShare = async () => {
    try {
        const uri = await viewShotRef.current.capture();
        const canShare = await Sharing.isAvailableAsync();
        
        if (canShare) {
            await Sharing.shareAsync(uri, {
                mimeType: 'image/jpeg',
                dialogTitle: 'Mi Prode F1',
                UTI: 'public.jpeg'
            });
        }
        handleFinish(); // Guarda y sale después de compartir
    } catch (error) {
        console.error("Error compartiendo:", error);
        alert("No se pudo compartir la imagen");
    }
    };

    const toggleFrancoSession = (session: string) => {
        let newSessions = [...votes.francoDNFSessions];
        if (newSessions.includes(session)) {
            newSessions = newSessions.filter(s => s !== session);
        } else {
            newSessions.push(session);
        }
        setVotes({ ...votes, francoDNFSessions: newSessions });
    };

    const toggleDriverSelection = (driver: any, isSprint = false) => {
        const key = isSprint ? 'top8Sprint' : 'top10';
        const currentSelection = [...votes[key]];
        const existingIndex = currentSelection.findIndex(d => d?.id === driver.id);
        if (existingIndex !== -1) {
            currentSelection[existingIndex] = null;
        } else {
            const emptySlot = currentSelection.findIndex(slot => slot === null);
            if (emptySlot !== -1) currentSelection[emptySlot] = driver;
        }
        setVotes({ ...votes, [key]: currentSelection });
    };

    const NumericSelector = ({ label, value, onUpdate }: any) => (
        <View style={styles.numericContainer}>
            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
            <Text style={styles.subLabel}>Elige un número.</Text>
            <View style={styles.counterRow}>
                <TouchableOpacity hitSlop={hitSlop} onPress={() => onUpdate(Math.max(0, value - 1))}>
                    <Ionicons name="remove-circle" size={45} color="#e10600" />
                </TouchableOpacity>
                <View style={[styles.numberBox, { borderColor: colors.border }]}>
                    <Text style={[styles.counterValue, { color: colors.text }]}>{value}</Text>
                </View>
                <TouchableOpacity hitSlop={hitSlop} onPress={() => onUpdate(value + 1)}>
                    <Ionicons name="add-circle" size={45} color="#e10600" />
                </TouchableOpacity>
            </View>
        </View>
    );
    const isStepValid = () => {
    if (step === 2) {
        // Si dice que abandona (true), debe haber al menos una sesión elegida
        if (votes.francoDNF === true && votes.francoDNFSessions.length === 0) return false;
        // Si no ha marcado Si o No, también podrías bloquearlo
        if (votes.francoDNF === null) return false;
    }
    return true;
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity hitSlop={hitSlop} onPress={() => step === 0 ? router.back() : setStep(prev => prev === 1.5 ? 1 : Math.floor(prev - 1))}>
                    <Ionicons name="arrow-back" size={28} color="#e10600" />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    {step === 4 ? "RESUMEN" : step === 0 ? "GENERALES" : step === 1 ? "TOP 10" : step === 1.5 ? "SPRINT" : step === 2 ? "ESPECIAL" : "VUELTA RÁPIDA"}
                </Text>
                <View style={{ width: 28 }} />
            </View>

            {/* CONTENIDO SCROLLABLE */}
            <ScrollView contentContainerStyle={[styles.scrollContent, step === 3 && { paddingBottom: 120 }]}>
                {step === 0 ? (
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View>
                        <View style={styles.section}>
                            <Text style={[styles.questionMain, { color: colors.text }]}>¿Saldrá el Safety Car durante la carrera?</Text>
                            <View style={styles.optionsColumn}>
                                {[true, false].map((val) => (
                                    <TouchableOpacity key={String(val)} style={[styles.binaryRow, votes.safetyCar === val && styles.selectedBinary]} onPress={() => setVotes({ ...votes, safetyCar: val })}>
                                        <Text style={[styles.binaryText, { color: colors.text }, votes.safetyCar === val && styles.selectedText]}>{val ? "Si" : "No"}</Text>
                                        {votes.safetyCar === val && <Ionicons name="checkmark" size={20} color="#fff" />}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        <Text style={[styles.questionMain, { color: colors.text }]}>¿Cuántas Red Flags va a haber durante la carrera?</Text>
                        <NumericSelector value={votes.redFlags} onUpdate={(v: number) => setVotes({ ...votes, redFlags: v })} />
                        <Text style={[styles.questionMain, { color: colors.text }]}>¿Cuántos pilotos no terminarán la carrera?</Text>
                        <NumericSelector value={votes.dnfs} onUpdate={(v: number) => setVotes({ ...votes, dnfs: v })} />
                    </View>
                    </ScrollView>
                ) : (step === 1 || step === 1.5) ? (
                    <View>
                        <View style={[styles.slotsContainer, { backgroundColor: colors.card }]}>
                            <Text style={[styles.questionMain, { color: colors.text, marginLeft: 20 }]}>{step === 1 ? "TOP 10 CARRERA" : "TOP 8 SPRINT"}</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slotsScroll}>
                                {votes[step === 1 ? 'top10' : 'top8Sprint'].map((d: any, i: number) => (
                                    <TouchableOpacity key={i} style={[styles.slotCard, d && styles.selectedSlot]} onPress={() => d && toggleDriverSelection(d, step === 1.5)}>
                                        <Text style={[styles.slotNumber, d ? { color: '#fff' } : { color: '#e10600' }]}>P{i + 1}</Text>
                                        <Text style={[styles.slotDriverName, { color: d ? '#fff' : colors.text }]} numberOfLines={1}>{d ? d.name.split(' ').pop() : "---"}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                        <View style={styles.gridWrapper}>
                            {DRIVERS.map((item) => {
                                const isSelected = votes[step === 1 ? 'top10' : 'top8Sprint'].some((d: any) => d?.id === item.id);
                                return (
                                    <TouchableOpacity key={item.id} style={[styles.gridCard, { backgroundColor: colors.card }, isSelected && styles.disabledGridCard]} onPress={() => !isSelected && toggleDriverSelection(item, step === 1.5)}>
                                        <Image source={item.image} style={styles.gridPhoto} />
                                        <Text style={[styles.gridName, { color: colors.text }]} numberOfLines={1}>{item.name.split(' ').pop()}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                ) : step === 2 ? (
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View>
                        <View style={styles.francoHeader}>
                            <Image source={DRIVERS.find(d => d.id === '11')?.image} style={styles.francoPhotoLarge} />
                            <Text style={[styles.questionMain, { color: colors.text }]}>Franco Colapinto 🇦🇷</Text>
                        </View>
                        <Text style={[styles.label, { marginTop: 1, color: colors.text }]}>¿Cuántos segundos durará el primer pit stop?</Text>

                        <Text style={[styles.subLabel, { color: colors.text }]}>Ingresa solo números y punto (ej: 2.5).</Text>
                        <TextInput 
                            style={[styles.inputField, { borderColor: colors.border, color: colors.text }]} 
                            placeholder="4.3" 
                            placeholderTextColor={colors.background === 'dark' ? '#rgba(255,255,255,0.5)' : '#999'} // Blanco con opacidad o gris
                            keyboardType="decimal-pad" 
                            value={votes.francoPitStop} 
                            onChangeText={(v) => setVotes({ ...votes, francoPitStop: v.replace(/[^0-9.]/g, '') })} 
                        />
                        
                        <Text style={[styles.label, { marginTop: 30, color: colors.text }]}>¿Abandonará alguna sesión?</Text>
                        <View style={styles.optionsColumn}>
                            {[true, false].map((val) => (
                                <TouchableOpacity key={String(val)} style={[styles.binaryRow, votes.francoDNF === val && styles.selectedBinary]} onPress={() => setVotes({ ...votes, francoDNF: val })}>
                                    <Text style={[styles.binaryText, { color: colors.text }, votes.francoDNF === val && styles.selectedText]}>{val ? "Si" : "No"}</Text>
                                    {votes.francoDNF === val && <Ionicons name="checkmark" size={20} color="#fff" />}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {votes.francoDNF && (
    <View style={styles.sessionsGrid}>
        {francoSessions.map((s) => {
            const isSelected = votes.francoDNFSessions.includes(s);
            return (
                <TouchableOpacity 
                    key={s} 
                    style={[
                        styles.sessionButton, 
                        { borderColor: colors.border },
                        isSelected && styles.selectedSession // Aplicamos el estilo rojo
                    ]} 
                    onPress={() => toggleFrancoSession(s)}
                >
                    <Text style={[
                        styles.sessionText, 
                        { color: isSelected ? '#fff' : colors.text }
                    ]}>
                        {s}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={14} color="#fff" style={{marginLeft: 5}} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        )}
                    </View>
                    </ScrollView>
                ) : step === 3 ? (
                    <View style={{ gap: 10 }}>
                        <Text style={[styles.questionMain, { color: colors.text }]}>Vuelta Rápida</Text>
                        {DRIVERS.map((item) => (
                            <TouchableOpacity key={item.id} style={[styles.driverCard, votes.fastestLap === item.id && styles.selectedDriver]} onPress={() => setVotes({ ...votes, fastestLap: item.id })}>
                                <Image source={item.image} style={styles.driverPhoto} />
                                <View style={{ flex: 1, marginLeft: 15 }}>
                                    <Text style={[styles.driverName, {color: colors.text}, votes.fastestLap === item.id && styles.selectedText]}>{item.name}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    /* PASO 4: RESUMEN FINAL */
                    <View>
                        <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }}>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryTitle}>MI PRODE - {nextRace.gp.toUpperCase()}</Text>
                                <View style={styles.divider} />
                                <Text style={styles.summaryLabel}>TOP 10 CARRERA:</Text>
                                <View style={styles.topGrid}>
                                    {votes.top10.map((d: any, i: number) => (
                                        <Text key={i} style={[styles.summaryTextSmall, { color: colors.text }]}>{i + 1}. {d ? d.name.split(' ').pop() : '---'}</Text>
                                    ))}
                                </View>
                                {isSprintWeekend && (
                                    <>
                                        <Text style={styles.summaryLabel}>TOP 8 SPRINT:</Text>
                                        <View style={styles.topGrid}>
                                            {votes.top8Sprint.map((d: any, i: number) => (
                                                <Text key={i} style={[styles.summaryTextSmall, { color: colors.text }]}>{i + 1}. {d ? d.name.split(' ').pop() : '---'}</Text>
                                            ))}
                                        </View>
                                    </>
                                )}
                                <Text style={styles.summaryLabel}>VUELTA RÁPIDA: <Text style={styles.summaryText}>{DRIVERS.find(d => d.id === votes.fastestLap)?.name || '---'}</Text></Text>
                                <Text style={styles.summaryLabel}>FRANCO DNF: <Text style={styles.summaryText}>{votes.francoDNF ? votes.francoDNFSessions.join(', ') : 'NO'}</Text></Text>
                            </View>
                        </ViewShot>
                    </View>
                )}
            </ScrollView>

            {/* BOTÓN STICKY (FUERA DEL SCROLLVIEW) */}
            <View style={[styles.hoverButtonContainer, { backgroundColor: colors.background }]}>
                {step === 4 ? (
                    <View style={{ gap: 10 }}>
                        <TouchableOpacity style={styles.continueButton} onPress={captureAndShare}>
                            <Ionicons name="share-social" size={20} color="#fff" style={{marginRight: 10}} />
                            <Text style={styles.continueText}>COMPARTIR</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.continueButton, {backgroundColor: '#444'}]} onPress={handleFinish}>
                            <Text style={styles.continueText}>FINALIZAR</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity 
                    style={[styles.continueButton, !isStepValid() && styles.disabledButton]} 
                    onPress={handleNextStep}
                    disabled={!isStepValid()}
                >
                    <Text style={styles.continueText}>{step === 3 ? "VER RESUMEN" : "SIGUIENTE"}</Text>
                </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    headerTitle: { fontFamily: 'F1-Black', fontSize: 18, textTransform: 'uppercase' },
    scrollContent: { paddingHorizontal: 25, paddingTop: 10, paddingBottom: 120 },
    section: { marginBottom: 30 },
    questionMain: { fontFamily: 'F1-Bold', fontSize: 20, marginBottom: 15 },
    label: { fontFamily: 'F1-Bold', fontSize: 16 },
    subLabel: { fontFamily: 'F1-Regular', fontSize: 12, color: '#666', marginBottom: 10 },
    optionsColumn: { gap: 10 },
    binaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#eee' },
    selectedBinary: { backgroundColor: '#e10600', borderColor: '#e10600' },
    binaryText: { fontFamily: 'F1-Bold', fontSize: 16 },
    selectedText: { color: '#fff' },
    numericContainer: { marginBottom: 30, alignItems: 'center' },
    counterRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    numberBox: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 25, paddingVertical: 10 },
    counterValue: { fontFamily: 'F1-Bold', fontSize: 18 },
    hoverButtonContainer: { position: 'absolute', bottom: 0, width: '100%', padding: 20, borderTopWidth: 1, borderTopColor: '#eee' },
    continueButton: { backgroundColor: '#e10600', padding: 16, borderRadius: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    continueText: { color: '#fff', fontFamily: 'F1-Bold', fontSize: 16 },
    slotsContainer: { paddingVertical: 15, borderRadius: 15, marginBottom: 20 },
    slotsScroll: { paddingHorizontal: 15, gap: 10 },
    slotCard: { width: 75, height: 70, borderRadius: 12, borderWidth: 1, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    selectedSlot: { backgroundColor: '#e10600', borderColor: '#e10600' },
    slotNumber: { fontFamily: 'F1-Black', fontSize: 12 },
    slotDriverName: { fontFamily: 'F1-Bold', fontSize: 10, marginTop: 2 },
    gridWrapper: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
    gridCard: { width: '30%', margin: '1.5%', alignItems: 'center', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#eee' },
    gridPhoto: { width: 50, height: 50, borderRadius: 25 },
    gridName: { fontFamily: 'F1-Bold', fontSize: 11, marginTop: 5 },
    disabledGridCard: { opacity: 0.2 },
    francoHeader: { alignItems: 'center', marginBottom: 20 },
    francoPhotoLarge: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#e10600' },
    inputField: { borderWidth: 1, borderRadius: 12, padding: 15, fontFamily: 'F1-Regular', fontSize: 16, textAlign: 'center' },
    sessionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 15 },
    sessionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: '#ddd' },
    selectedSession: { backgroundColor: '#e10600', borderColor: '#e10600' },
    sessionText: { fontFamily: 'F1-Bold', fontSize: 11 },
    driverCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 15, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
    selectedDriver: { backgroundColor: '#e10600', borderColor: '#e10600' },
    driverPhoto: { width: 45, height: 45, borderRadius: 22 },
    driverName: { fontFamily: 'F1-Bold', fontSize: 14 },
    summaryCard: { backgroundColor: '#111', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#e10600' },
    summaryTitle: { color: '#e10600', fontFamily: 'F1-Black', fontSize: 20, textAlign: 'center', marginBottom: 10 },
    summaryLabel: { color: '#e10600', fontFamily: 'F1-Bold', fontSize: 12, marginTop: 10 },
    summaryText: { color: '#fff', fontFamily: 'F1-Regular' },
    summaryTextSmall: { color: '#fff', fontFamily: 'F1-Regular', width: '48%', marginBottom: 2 },
    topGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    divider: { height: 1, backgroundColor: '#333', marginVertical: 10 },
    disabledButton: { backgroundColor: '#666', opacity: 0.5 }
});