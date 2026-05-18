import { Ionicons, Octicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Formik } from 'formik';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SelectList } from 'react-native-dropdown-select-list';

import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { addUser, googleSignIn, setCurrentUser } from '../services/UserStore';
import { affiliationsForRole, PASSWORD_RULES, ROLES, signupSchema } from '../utils/validation';
import { moderateScale } from '../utils/responsive';

import {
    ButtonText,
    Colors,
    ExtraSmallText,
    ExtraText,
    LeftIcon,
    Line,
    LineContainer,
    OrText,
    PageLogo,
    RightIcon,
    StyledButton,
    StyledContainer,
    StyledFormArea,
    StyledTextInput,
    TextLink,
    TextLinkContent,
} from '../components/styles';

// Styling for the role / affiliation dropdowns so they match StyledTextInput.
const dropdownBox = {
    backgroundColor: Colors.base_page,
    borderWidth: 0,
    borderRadius: 16,
    height: 55,
    alignItems: 'center',
    paddingHorizontal: 18,
};
const dropdownList = {
    backgroundColor: Colors.base_page,
    borderWidth: 0,
    borderRadius: 16,
    marginTop: 4,
};
const dropdownInput = { color: Colors.text_active, fontSize: 16 };

const FieldError = ({ touched, error }) =>
    touched && error ? (
        <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4, marginLeft: 6 }}>{error}</Text>
    ) : null;

const MyTextInput = ({ icon, isPassword, hidePassword, setHidePassword, error, touched, ...props }) => (
    <View style={{ marginBottom: 12 }}>
        <View style={{ justifyContent: 'center' }}>
            <LeftIcon>
                <Octicons name={icon} size={20} color={touched && error ? '#ef4444' : Colors.text_idle} />
            </LeftIcon>
            <StyledTextInput {...props} style={touched && error ? { borderWidth: 1, borderColor: '#ef4444' } : {}} />
            {isPassword && (
                <RightIcon onPress={() => setHidePassword(!hidePassword)}>
                    <Ionicons name={hidePassword ? 'eye-off' : 'eye'} size={20} color={Colors.text_idle} />
                </RightIcon>
            )}
        </View>
        <FieldError touched={touched} error={error} />
    </View>
);

const Signup = () => {
    const router = useRouter();
    const { prefill_email, prefill_name } = useLocalSearchParams();
    const fromGoogle = !!prefill_email;
    const [hidePassword, setHidePassword] = useState(true);
    const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
    const [formError, setFormError] = useState('');

    const handleGoogleSignUp = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const idToken = userInfo.data?.idToken;
            if (!idToken) {
                setFormError('No ID token received from Google.');
                return;
            }
            const result = await googleSignIn(idToken);
            if (result.success) {
                router.replace('/UserOnboarding4');
            } else {
                setFormError(result.message || 'Google sign-up failed.');
            }
        } catch (error) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) return;
            if (error.code === statusCodes.IN_PROGRESS) return;
            setFormError(error.message || 'Something went wrong with Google sign-in.');
        }
    };

    const handleRegister = async (values, { setSubmitting }) => {
        setFormError('');
        const passenger_type = values.role.toLowerCase();
        const result = await addUser(
            values.full_name,
            values.email,
            values.password,
            values.phone,
            passenger_type,
            values.department_office
        );
        setSubmitting(false);

        if (result.success) {
            await setCurrentUser({
                full_name: values.full_name,
                name: values.full_name,
                email: values.email,
                passenger_type,
                department_office: values.department_office,
            });
            router.replace('/UserOnboarding4');
        } else {
            setFormError(result.message);
        }
    };

    return (
        <StyledContainer>
            <StatusBar style="light" />
            <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}
                    >
                        <PageLogo
                            resizeMode="contain"
                            source={require('../assets/images/UPasakayBig.png')}
                            style={{ width: moderateScale(220), height: moderateScale(124) }}
                        />

                        <Text
                            style={{
                                color: Colors.white,
                                fontSize: moderateScale(26),
                                fontFamily: 'Nunito-Bold',
                                alignSelf: 'flex-start',
                                marginLeft: '2.5%',
                                marginBottom: 12,
                            }}
                        >
                            Create your account
                        </Text>

                        <Formik
                            initialValues={{
                                email: prefill_email || '',
                                password: '',
                                confirmPassword: '',
                                full_name: prefill_name || '',
                                phone: '',
                                role: '',
                                department_office: '',
                            }}
                            validationSchema={signupSchema}
                            onSubmit={handleRegister}
                        >
                            {({
                                handleChange,
                                handleBlur,
                                handleSubmit,
                                setFieldValue,
                                setFieldTouched,
                                values,
                                errors,
                                touched,
                                isValid,
                                dirty,
                                isSubmitting,
                            }) => (
                                <StyledFormArea>
                                    {formError ? (
                                        <View
                                            style={{
                                                backgroundColor: 'rgba(239,68,68,0.15)',
                                                borderColor: '#ef4444',
                                                borderWidth: 1,
                                                borderRadius: 12,
                                                padding: 12,
                                                marginBottom: 12,
                                            }}
                                        >
                                            <Text style={{ color: '#ffd9d9', fontSize: 13, textAlign: 'center' }}>
                                                {formError}
                                            </Text>
                                        </View>
                                    ) : null}

                                    {fromGoogle && (
                                        <Text style={{ color: Colors.text_idle, fontSize: 12, marginBottom: 4, marginLeft: 6 }}>
                                            Email pre-filled from your Google account
                                        </Text>
                                    )}
                                    <MyTextInput
                                        icon="mail"
                                        placeholder="Enter your email address"
                                        placeholderTextColor={Colors.text_idle}
                                        onChangeText={handleChange('email')}
                                        onBlur={handleBlur('email')}
                                        value={values.email}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        editable={!fromGoogle}
                                        error={errors.email}
                                        touched={touched.email}
                                        style={fromGoogle ? { opacity: 0.6 } : {}}
                                    />

                                    <MyTextInput
                                        icon="lock"
                                        placeholder="Enter your password"
                                        placeholderTextColor={Colors.text_idle}
                                        onChangeText={handleChange('password')}
                                        onBlur={handleBlur('password')}
                                        value={values.password}
                                        secureTextEntry={hidePassword}
                                        isPassword
                                        hidePassword={hidePassword}
                                        setHidePassword={setHidePassword}
                                        error={errors.password}
                                        touched={touched.password}
                                    />

                                    {/* Live password requirements checklist */}
                                    <View style={{ marginBottom: 12, marginLeft: 4 }}>
                                        {PASSWORD_RULES.map((rule) => {
                                            const ok = rule.test(values.password || '');
                                            return (
                                                <View
                                                    key={rule.key}
                                                    style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 2 }}
                                                >
                                                    <Ionicons
                                                        name={ok ? 'checkmark-circle' : 'ellipse-outline'}
                                                        size={15}
                                                        color={ok ? '#4ade80' : Colors.text_idle}
                                                    />
                                                    <Text
                                                        style={{
                                                            color: ok ? '#4ade80' : Colors.white,
                                                            fontSize: 12,
                                                            marginLeft: 6,
                                                        }}
                                                    >
                                                        {rule.label}
                                                    </Text>
                                                </View>
                                            );
                                        })}
                                    </View>

                                    <MyTextInput
                                        icon="lock"
                                        placeholder="Confirm your password"
                                        placeholderTextColor={Colors.text_idle}
                                        onChangeText={handleChange('confirmPassword')}
                                        onBlur={handleBlur('confirmPassword')}
                                        value={values.confirmPassword}
                                        secureTextEntry={hideConfirmPassword}
                                        isPassword
                                        hidePassword={hideConfirmPassword}
                                        setHidePassword={setHideConfirmPassword}
                                        error={errors.confirmPassword}
                                        touched={touched.confirmPassword}
                                    />

                                    <MyTextInput
                                        icon="person"
                                        placeholder="Full Name"
                                        placeholderTextColor={Colors.text_idle}
                                        onChangeText={handleChange('full_name')}
                                        onBlur={handleBlur('full_name')}
                                        value={values.full_name}
                                        editable={!fromGoogle}
                                        error={errors.full_name}
                                        touched={touched.full_name}
                                        style={fromGoogle ? { opacity: 0.6 } : {}}
                                    />

                                    <MyTextInput
                                        icon="device-mobile"
                                        placeholder="Phone Number"
                                        placeholderTextColor={Colors.text_idle}
                                        onChangeText={handleChange('phone')}
                                        onBlur={handleBlur('phone')}
                                        value={values.phone}
                                        keyboardType="phone-pad"
                                        error={errors.phone}
                                        touched={touched.phone}
                                    />

                                    {/* ROLE */}
                                    <View style={{ marginBottom: 12 }}>
                                        <SelectList
                                            setSelected={(val) => {
                                                setFieldValue('role', val);
                                                setFieldTouched('role', true);
                                                setFieldValue('department_office', '');
                                            }}
                                            data={ROLES.map((r) => ({ key: r, value: r }))}
                                            save="value"
                                            search={false}
                                            maxHeight={240}
                                            placeholder="Select your role"
                                            boxStyles={dropdownBox}
                                            dropdownStyles={dropdownList}
                                            inputStyles={dropdownInput}
                                            dropdownTextStyles={dropdownInput}
                                        />
                                        <FieldError touched={touched.role} error={errors.role} />
                                    </View>

                                    {/* COLLEGE / OFFICE */}
                                    <View style={{ marginBottom: 12 }}>
                                        <SelectList
                                            key={values.role || 'no-role'}
                                            setSelected={(val) => {
                                                setFieldValue('department_office', val);
                                                setFieldTouched('department_office', true);
                                            }}
                                            data={affiliationsForRole(values.role).map((a) => ({
                                                key: a,
                                                value: a,
                                            }))}
                                            save="value"
                                            search={false}
                                            maxHeight={240}
                                            placeholder={
                                                values.role ? 'Select College/Office' : 'Select your role first'
                                            }
                                            boxStyles={dropdownBox}
                                            dropdownStyles={dropdownList}
                                            inputStyles={dropdownInput}
                                            dropdownTextStyles={dropdownInput}
                                        />
                                        <FieldError
                                            touched={touched.department_office}
                                            error={errors.department_office}
                                        />
                                    </View>

                                    <ExtraSmallText style={{ marginTop: 4 }}>
                                        By clicking 'Create Account', you have read and agreed to our{'\n'}
                                        <TextLinkContent style={{ color: Colors.button_loginsignup, fontSize: 12 }}>
                                            Terms of Service
                                        </TextLinkContent>
                                        <ExtraSmallText> and </ExtraSmallText>
                                        <TextLinkContent style={{ color: Colors.button_loginsignup, fontSize: 12 }}>
                                            Privacy Policy
                                        </TextLinkContent>
                                    </ExtraSmallText>

                                    <StyledButton
                                        onPress={handleSubmit}
                                        disabled={!isValid || !dirty || isSubmitting}
                                        style={{ marginTop: 12, opacity: !isValid || !dirty || isSubmitting ? 0.5 : 1 }}
                                    >
                                        <ButtonText>
                                            {isSubmitting ? 'Creating account...' : 'Create Account'}
                                        </ButtonText>
                                    </StyledButton>

                                    <LineContainer>
                                        <Line />
                                        <OrText> OR </OrText>
                                        <Line />
                                    </LineContainer>

                                    <StyledButton
                                        onPress={handleGoogleSignUp}
                                        style={{ backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                    >
                                        <Image
                                            source={require('../assets/images/google-logo.png')}
                                            style={{ width: 20, height: 20 }}
                                            resizeMode="contain"
                                        />
                                        <ButtonText style={{ color: '#333' }}>Sign Up with Google</ButtonText>
                                    </StyledButton>

                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginTop: 14,
                                        }}
                                    >
                                        <ExtraText style={{ marginTop: 0 }}>Already have an account? </ExtraText>
                                        <TextLink onPress={() => router.replace('/Login')}>
                                            <TextLinkContent>Log In</TextLinkContent>
                                        </TextLink>
                                    </View>
                                </StyledFormArea>
                            )}
                        </Formik>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </StyledContainer>
    );
};

export default Signup;
