import { Box, Button, Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, Stack, Text } from "@chakra-ui/react"
import { useAuthStore } from "../stores/auth"
import { useUIManager } from "../stores/ui"

function AccountInfo() {
    const uiManager = useUIManager()
    const user = useAuthStore((state) => state.user)

    return (
        <Modal
            isOpen={uiManager.viewingProfile}
            onClose={() => {
                uiManager.setViewingProfile(false)
            }}
        >
            <ModalContent>
                <ModalHeader fontSize="lg" fontWeight="bold">
                    Hello, {user?.FirstName} {user?.LastName}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Stack spacing={5}>
                        <Box>
                            <Heading fontSize="sm" fontWeight="semibold" pb={2}>
                                Username
                            </Heading>
                            <Text>{user?.Username}</Text>
                        </Box>
                        <Box gap={2}>
                            <Heading fontSize="sm" fontWeight="semibold" pb={2}>
                                Member ID
                            </Heading>
                            <Text>{user?.MemberID}</Text>
                        </Box>
                        <Box gap={2}>
                            <Heading fontSize="sm" fontWeight="semibold" pb={2}>
                                Permission Level
                            </Heading>
                            <Text>{user?.Permission}</Text>
                        </Box>
                        <Box gap={2}>
                            <Heading fontSize="sm" fontWeight="semibold" pb={2}>
                                State ID
                            </Heading>
                            <Text>{user?.StateID ?? "Not set"}</Text>
                        </Box>
                    </Stack>
                </ModalBody>
                <ModalFooter>
                    <Button
                        onClick={() => {
                            uiManager.setViewingProfile(false)
                        }}
                    >
                        Done
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export { AccountInfo }
